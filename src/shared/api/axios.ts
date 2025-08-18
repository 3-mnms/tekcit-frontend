// src/shared/api/axios.ts
import axios, { AxiosError, AxiosHeaders } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { tokenStore } from '@/shared/storage/tokenStore'
import { reissue, type ReissueResponseDTO } from './auth/login'

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true, 
})

function ensureAxiosHeaders(h: InternalAxiosRequestConfig['headers']): AxiosHeaders {
  return h instanceof AxiosHeaders ? h : new AxiosHeaders(h as any)
}

function setBearer(cfg: InternalAxiosRequestConfig, token: string) {
  const headers = ensureAxiosHeaders(cfg.headers)
  headers.set('Authorization', `Bearer ${token}`)
  cfg.headers = headers
}

api.interceptors.request.use((cfg) => {
  const at = tokenStore.get()
  if (at) setBearer(cfg, at)
  return cfg
})

// 401→재발급→원요청 재실행, 동시요청 single-flight
let refreshPromise: Promise<string | null> | null = null

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original =
      error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    // 401 아니거나 원본 없으면 그대로 실패
    if (!original || error.response?.status !== 401) throw error

    // 로그인/재발급 자체 401은 패스
    const url = original.url ?? ''
    if (original._retry || url.includes('/users/login') || url.includes('/users/reissue')) {
      throw error
    }
    original._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          const data = await reissue()
          const newAccess = (data as ReissueResponseDTO).accessToken ?? null
          if (newAccess) {
            tokenStore.set(newAccess)
            api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`
            return newAccess
          }
          return null
        })().finally(() => {
          // 다음 401에서 다시 시도할 수 있도록 해제
          setTimeout(() => { refreshPromise = null }, 0)
        })
      }

      const token = await refreshPromise
      if (!token) {
        tokenStore.clear()
        throw error
      }

      // ✅ 원요청에도 Bearer 재부착
      setBearer(original, token)
      return api(original)
    } catch (e) {
      tokenStore.clear()
      throw e
    }
  },
)