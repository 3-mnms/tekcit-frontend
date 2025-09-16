// useLoginMutation.ts
import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { type LoginResponseDTO } from '@/shared/api/auth/login'
import { useAuthStore } from '@/shared/storage/useAuthStore'
import { parseJwt } from '@/shared/storage/jwt'
import { setAuthHeaderToken } from '@/shared/config/axios'
import { login, confirmLogin, isLoginSuccess, isLoginConflict, type LoginPayload } from '@/shared/api/auth/login'

type JwtRole = 'USER' | 'HOST' | 'ADMIN'
type JwtPayload = { sub: string; userId: number; role: JwtRole; name: string; exp?: number; iat?: number }
export type ErrorBody = { errorMessage?: string; message?: string }

export const useLoginMutation = () => {
  const setAccessToken = useAuthStore((s) => (s as any).setAccessToken as ((t: string|null)=>void)|undefined)
  const setUserFromToken = useAuthStore((s) => (s as any).setUserFromToken as ((t: string|null)=>void)|undefined)
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation<LoginResponseDTO, AxiosError<ErrorBody>, LoginPayload>({
    mutationFn: login,
    onSuccess: (data) => {
      const accessToken = data?.accessToken
      if (!accessToken) { console.warn('[LOGIN OK] but no accessToken', data); return }

      // ✅ 1) 헤더(in-memory)에 즉시 반영 (가장 먼저!)
      setAuthHeaderToken(accessToken)

      // ✅ 2) 스토어 갱신 (UI 상태)
      if (setAccessToken) setAccessToken(accessToken)
      if (setUserFromToken) setUserFromToken(accessToken)
      else {
        const decoded = parseJwt<JwtPayload>(accessToken)
        if (decoded) setUser({ userId: decoded.userId, role: decoded.role, name: decoded.name, loginId: decoded.sub })
      }
    },
    onError: (err) => {
      console.warn('[LOGIN FAIL]', err.response?.status, err.response?.data)
    },
  })
}

export function useLoginFlow() {
  const m = useMutation({
    mutationFn: (p: LoginPayload) => login(p),
    onSuccess: async (res) => {
      if (isLoginSuccess(res)) {
        return
      }
      if (isLoginConflict(res)) {
        const ok = window.confirm('이미 로그인된 세션이 있습니다.\n기존 세션을 로그아웃하고 이 기기에서 로그인하시겠습니까?')
        if (!ok) return
      await confirmLogin(res.loginTicket)
        return
      }
      alert('알 수 없는 로그인 응답입니다.')
    },
  })
  return m
}