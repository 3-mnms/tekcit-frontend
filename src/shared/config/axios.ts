import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'
import { reissue, type ReissueResponseDTO } from '../api/auth/login'
import { useAuthStore } from '@/shared/storage/useAuthStore'
import { getEnv } from '@/shared/config/env'

const API_URL = getEnv('API_URL', '') + '/api'

export const api = axios.create({
  baseURL:           API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

function ensureAxiosHeaders(h: InternalAxiosRequestConfig['headers']): AxiosHeaders {
  return h instanceof AxiosHeaders ? h : new AxiosHeaders(h as any)
}
function setBearer(cfg: InternalAxiosRequestConfig, token: string) {
  const headers = ensureAxiosHeaders(cfg.headers)
  headers.set('Authorization', `Bearer ${token}`)
  cfg.headers = headers
}
function unsetBearer(cfg: InternalAxiosRequestConfig) {
  const headers = ensureAxiosHeaders(cfg.headers)
  try { (headers as AxiosHeaders).delete?.('Authorization') } catch {}
  delete (headers as any).Authorization
  cfg.headers = headers
}

// 요청 인터셉터: Zustand에서 바로 토큰
// ✅ 항상 주석 달기!
// 요청 인터셉터: 이미 요청에 Authorization이 있으면 건드리지 않고, 없을 때만 Zustand 토큰을 붙임
api.interceptors.request.use((cfg) => {
  const headers = ensureAxiosHeaders(cfg.headers)

  // 1) 요청에 이미 Authorization이 들어있다면(개별 API에서 직접 넣은 경우) 그대로 둔다
  if (headers.has('Authorization')) {
    return cfg
  }

  // 2) 그렇지 않다면 Zustand에서 accessToken을 가져와 붙인다
  const at = useAuthStore.getState().accessToken
  if (at) {
    headers.set('Authorization', `Bearer ${at}`) // ✅ 토큰 자동 부착
  }

  cfg.headers = headers
  return cfg
})

// 401 처리: 재발급(single-flight) -> 토큰/유저 갱신 -> 원요청 재실행
let refreshPromise: Promise<string | null> | null = null

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    if (!original || error.response?.status !== 401) throw error

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
            // ✅ Zustand에만 저장 (메모리)
            useAuthStore.getState().setAccessToken(newAccess)
            return newAccess
          }
          return null
        })().finally(() => {
          setTimeout(() => { refreshPromise = null }, 0)
        })
      }

      const token = await refreshPromise
      if (!token) {
        useAuthStore.getState().logout()
        throw error
      }

      setBearer(original, token)
      return api(original)
    } catch (e) {
      useAuthStore.getState().logout()
      throw e
    }
  },
)
