import { tokenStore } from '@/shared/storage/tokenStore'
import { parseJwt } from '@/shared/storage/jwt'

export type JwtRole = 'USER' | 'HOST' | 'ADMIN'
export interface JwtPayload {
  sub: string
  name: string
  userId: number
  role: JwtRole
  exp?: number
  iat?: number
}

export const MAX_UI_SEC = 60 * 60

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function remainingSecondsFromLS(maxUiSec: number = MAX_UI_SEC): number {
  const token = tokenStore.get()
  if (!token) return maxUiSec

  const decoded = parseJwt<JwtPayload>(token)
  if (decoded?.exp) {
    const left = Math.floor(decoded.exp * 1000 - Date.now()) / 1000
    return clamp(Math.floor(left), 0, maxUiSec)
  }
  return maxUiSec
}

export function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}
