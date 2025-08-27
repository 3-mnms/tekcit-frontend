// useLoginMutation.ts
import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { login, type LoginPayload, type LoginResponseDTO } from '@/shared/api/auth/login'
import { useAuthStore } from '@/shared/storage/useAuthStore'
import { parseJwt } from '@/shared/storage/jwt'
import { setAuthHeaderToken } from '@/shared/config/axios'

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
