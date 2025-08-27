// src/shared/config/axios.ts
import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'
import { reissue, type ReissueResponseDTO } from '../api/auth/login'
import { getEnv } from '@/shared/config/env'

const API_URL = getEnv('API_URL', '') + '/api'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
})
export const AUTH_TOKEN_EVENT = 'auth:token'
let ACCESS_TOKEN_MEM: string | null = null
export function setAuthHeaderToken(token: string | null) {
  ACCESS_TOKEN_MEM = token ?? null
  try {
    window.dispatchEvent(new CustomEvent(AUTH_TOKEN_EVENT, { detail: ACCESS_TOKEN_MEM }))
  } catch {}
}

export function clearAuthHeaderToken() {
  ACCESS_TOKEN_MEM = null
  try {
    window.dispatchEvent(new CustomEvent(AUTH_TOKEN_EVENT, { detail: null }))
  } catch {}
}

const ensureAxiosHeaders = (h: InternalAxiosRequestConfig['headers']) =>
  h instanceof AxiosHeaders ? h : new AxiosHeaders(h as any)
const setBearer = (cfg: InternalAxiosRequestConfig, token: string) => {
  const headers = ensureAxiosHeaders(cfg.headers); headers.set('Authorization', `Bearer ${token}`); cfg.headers = headers
}
const unsetBearer = (cfg: InternalAxiosRequestConfig) => {
  const headers = ensureAxiosHeaders(cfg.headers); try { (headers as AxiosHeaders).delete?.('Authorization') } catch {}
  delete (headers as any).Authorization; cfg.headers = headers
}

const isAuthPath = (url: string) => url.includes('/users/login') || url.includes('/users/reissue')

api.interceptors.request.use((cfg) => {
  const url = cfg.url ?? ''
  if (ACCESS_TOKEN_MEM && !isAuthPath(url)) setBearer(cfg, ACCESS_TOKEN_MEM)
  else unsetBearer(cfg)
  return cfg
})

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
          console.log('[401 reissue]', data)
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
