// src/shared/api/axios.ts
import axios, { AxiosError, AxiosHeaders } from 'axios';
import type { InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import { tokenStore } from '@/shared/storage/tokenStore';
import { reissue } from './auth/login';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // refresh 쿠키 전송용
});

// 공통: Authorization 헤더 세팅 (Axios v1 타입 안전)
function setAuthHeader(
  headers: AxiosRequestHeaders | AxiosHeaders | undefined,
  token: string
): AxiosRequestHeaders | AxiosHeaders {
  if (!headers) return new AxiosHeaders({ Authorization: `Bearer ${token}` });

  if (headers instanceof AxiosHeaders) {
    headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  (headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`;
  return headers;
}

// 요청 인터셉터: accessToken 있으면 붙이기
// 요청 인터셉터
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const at = tokenStore.get();
  if (at) {
    console.log('[REQ] accessToken 존재 → Authorization 헤더 추가');
    config.headers = setAuthHeader(config.headers, at);
  } else {
    console.log('[REQ] accessToken 없음 → Authorization 헤더 미추가');
  }
  return config;
});

// 응답 인터셉터: 401 → reissue 1회 시도 후 원요청 재실행
let isRefreshing = false;
let refreshWaiters: Array<(token: string | null) => void> = [];

const notifyAll = (token: string | null) => {
  refreshWaiters.forEach((resolve) => resolve(token));
  refreshWaiters = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // 401이 아니면 그대로 실패
    if (error.response?.status !== 401 || !original) {
      throw error;
    }

    // 재시도 플래그로 무한 루프 방지
    if (original._retry) {
      throw error;
    }

    // 로그인/재발급 자체가 401이면 바로 실패
    const url = original.url || '';
    if (url.includes('/users/login') || url.includes('/users/reissue')) {
      throw error;
    }

    // access 만료 → 재발급 시도
    if (!isRefreshing) {
      isRefreshing = true;
      original._retry = true;

      try {
        const data = await reissue(); // refresh 쿠키가 같이 전송됨
        const newAccess = (data as any)?.accessToken ?? null;

        if (newAccess) {
          tokenStore.set(newAccess);
          notifyAll(newAccess);
          isRefreshing = false;

          // 원 요청에 새 토큰 부착 후 재요청
          original.headers = setAuthHeader(original.headers as any, newAccess);
          return api(original);
        }

        // 토큰이 안 왔으면 실패 처리
        notifyAll(null);
        isRefreshing = false;
        tokenStore.clear();
        throw error;
      } catch (e) {
        // 재발급 실패 → 토큰 초기화 후 로그인 유도
        notifyAll(null);
        isRefreshing = false;
        tokenStore.clear();
        // 필요 시 라우팅: window.location.href = '/login';
        throw error;
      }
    }

    // 이미 누군가 재발급 중이면 결과 기다렸다가 재시도
    return new Promise((resolve, reject) => {
      original._retry = true;
      refreshWaiters.push((token) => {
        if (!token) return reject(error);
        original.headers = setAuthHeader(original.headers as any, token);
        resolve(api(original));
      });
    });
  }
);