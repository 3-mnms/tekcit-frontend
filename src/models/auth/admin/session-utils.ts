// src/models/auth/admin/session-utils.ts (예시 경로)
import { useAuthStore } from '@/shared/storage/useAuthStore' 
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

/**
 * 현재 메모리(Zustand)에 있는 accessToken의 exp로부터 남은 시간을 계산
 * 토큰이 없거나 exp가 없으면 maxUiSec으로 대체
 */
export function remainingSecondsFromStore(maxUiSec: number = MAX_UI_SEC): number {
  const token = useAuthStore.getState().accessToken // ✅ 메모리에서 직접
  if (!token) return maxUiSec

  const decoded = parseJwt<JwtPayload>(token)
  if (decoded?.exp) {
    const leftMs = decoded.exp * 1000 - Date.now()
    const leftSec = Math.floor(leftMs / 1000)
    return clamp(leftSec, 0, maxUiSec)
  }
  return maxUiSec
}

export function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}
