// src/shared/config/axios.ts
import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'
import { reissue, type ReissueResponseDTO } from '../api/auth/login'
import { getEnv } from '@/shared/config/env'
import { useAuthStore } from '@/shared/storage/useAuthStore'

const API_URL = getEnv('API_URL', '') + '/api'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
})

const API_URL2 = getEnv('API_URL', '')

export const api2 = axios.create({
  baseURL: API_URL2,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
})

export const AUTH_TOKEN_EVENT = 'auth:token'
let ACCESS_TOKEN_MEM: string | null = null

export function setAuthHeaderToken(token: string | null) {
  ACCESS_TOKEN_MEM = token ?? null
  try { window.dispatchEvent(new CustomEvent(AUTH_TOKEN_EVENT, { detail: ACCESS_TOKEN_MEM })) } catch { }
}

export function clearAuthHeaderToken() {
  ACCESS_TOKEN_MEM = null
  try { window.dispatchEvent(new CustomEvent(AUTH_TOKEN_EVENT, { detail: null })) } catch { }
}

const ensureAxiosHeaders = (h: InternalAxiosRequestConfig['headers']) =>
  h instanceof AxiosHeaders ? h : new AxiosHeaders(h as any)

const setBearer = (cfg: InternalAxiosRequestConfig, token: string) => {
  const headers = ensureAxiosHeaders(cfg.headers)
  headers.set('Authorization', `Bearer ${token}`)
  cfg.headers = headers
}
const unsetBearer = (cfg: InternalAxiosRequestConfig) => {
  const headers = ensureAxiosHeaders(cfg.headers)
  try { (headers as AxiosHeaders).delete?.('Authorization') } catch { }
  delete (headers as any).Authorization
  cfg.headers = headers
}

const isAuthPath = (url: string) =>
  url.includes('/users/login') || url.includes('/users/reissue')

const isFormData = (data: unknown) =>
  typeof FormData !== 'undefined' && data instanceof FormData

// 주석: 안전한 userId 추출 — store, localStorage, JWT 순서로 시도 멍
function getUserIdForHeader(): string | null {
  // 0) 숫자 문자열 가드 멍
  const toId = (v: unknown): string | null => {
    const n = Number(v)
    return Number.isFinite(n) && n > 0 ? String(n) : null
  }

  // 1) Zustand store 멍
  try {
    const uid = (useAuthStore.getState()?.user as any)?.userId
    const s = toId(uid)
    if (s) return s
  } catch { }

  // 2) localStorage (persist된 user 객체/토큰 등) 멍
  try {
    // 주석: 프로젝트에서 쓰는 키 이름에 맞춰 추가 멍
    const rawUser = localStorage.getItem('user') || localStorage.getItem('auth:user')
    if (rawUser) {
      const obj = JSON.parse(rawUser)
      const s = toId(obj?.userId ?? obj?.id)
      if (s) return s
    }
  } catch { }

  // 3) ACCESS_TOKEN_MEM(JWT) payload 파싱 멍
  try {
    if (!ACCESS_TOKEN_MEM) return null
    const raw = ACCESS_TOKEN_MEM.startsWith('Bearer ') ? ACCESS_TOKEN_MEM.slice(7) : ACCESS_TOKEN_MEM
    const part = raw.split('.')[1] ?? ''
    const safe = part.replace(/-/g, '+').replace(/_/g, '/')
    const padded = safe + '='.repeat((4 - (safe.length % 4)) % 4)
    const payload = JSON.parse(atob(padded))
    const s = toId(payload?.userId ?? payload?.sub ?? payload?.uid)
    if (s) return s
  } catch { }

  // 4) 못 찾았으면 null 멍
  return null
}

// ===== 요청 인터셉터: 토큰 + FormData 멀티파트 처리 =====
api.interceptors.request.use((cfg) => {
  const url = cfg.url ?? ''
  const headers = ensureAxiosHeaders(cfg.headers)

  // 주석: Authorization (기존 로직) 멍
  if (ACCESS_TOKEN_MEM && !isAuthPath(url)) setBearer(cfg, ACCESS_TOKEN_MEM)
  else unsetBearer(cfg)

  // // ✅ X-User-Id 전역 주입 멍
  // const uid = getUserIdForHeader()
  // if (uid) {
  //   headers.set('X-User-Id', uid)
  // } else {
  //   headers.delete('X-User-Id')
  //   // 주석: 개발 중 빠르게 원인 파악용 경고 멍 (운영 배포 시 제거해도 OK)
  //   if (process.env.NODE_ENV !== 'production') {
  //     // eslint-disable-next-line no-console
  //     console.warn('[axios] X-User-Id 누락 — store/localStorage/JWT 어디에서도 userId를 찾지 못했습니다.')
  //   }
  // }

  // 주석: FormData/JSON 헤더 처리 (기존) 멍
  if (isFormData(cfg.data)) {
    headers.delete('Content-Type')
    headers.delete('content-type')
    cfg.transformRequest = [(data) => data]
  } else {
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  }

  cfg.headers = headers
  return cfg
})

// ===== 응답 인터셉터: 401 → 토큰 재발급 후 원요청 재시도 =====
let refreshPromise: Promise<string | null> | null = null

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    if (!original || error.response?.status !== 401) throw error

    const url = original.url ?? ''
    if (original._retry || isAuthPath(url)) throw error
    original._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          const data = await reissue()
          const newAccess = (data as ReissueResponseDTO)?.accessToken ?? null
          if (newAccess) { setAuthHeaderToken(newAccess); return newAccess }
          return null
        })().finally(() => { setTimeout(() => { refreshPromise = null }, 0) })
      }

      const token = await refreshPromise
      if (!token) { clearAuthHeaderToken(); throw error }

      setBearer(original, token)
      return api(original)
    } catch (e) {
      clearAuthHeaderToken()
      throw e
    }
  },
)
