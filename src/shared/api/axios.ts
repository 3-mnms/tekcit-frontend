import axios, { AxiosError, AxiosHeaders } from 'axios';
import type { InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import { tokenStore } from '@/shared/storage/tokenStore';
import { reissue } from './auth/login';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export const kakaoApi = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
});

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

    if (error.response?.status !== 401 || !original) {
      throw error;
    }

    if (original._retry) {
      throw error;
    }

    const url = original.url || '';
    if (url.includes('/users/login') || url.includes('/users/reissue')) {
      throw error;
    }

    if (!isRefreshing) {
      isRefreshing = true;
      original._retry = true;

      try {
        const data = await reissue(); 
        const newAccess = (data)?.accessToken ?? null;

        if (newAccess) {
          tokenStore.set(newAccess);
          notifyAll(newAccess);
          isRefreshing = false;

          original.headers = setAuthHeader(original.headers, newAccess);
          return api(original);
        }

        notifyAll(null);
        isRefreshing = false;
        tokenStore.clear();
        throw error;
      } catch {
        notifyAll(null);
        isRefreshing = false;
        tokenStore.clear();
        throw error;
      }
    }

    return new Promise((resolve, reject) => {
      original._retry = true;
      refreshWaiters.push((token) => {
        if (!token) return reject(error);
        original.headers = setAuthHeader(original.headers, token);
        resolve(api(original));
      });
    });
  }
);