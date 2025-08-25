import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { login, type LoginPayload, type LoginResponseDTO } from '@/shared/api/auth/login'
import { useAuthStore } from '@/shared/storage/useAuthStore'
import { parseJwt } from '@/shared/storage/jwt'

type JwtRole = 'USER' | 'HOST' | 'ADMIN'
type JwtPayload = {
  sub: string
  userId: number
  role: JwtRole
  name: string
  exp?: number
  iat?: number
}

export type ErrorBody = { errorMessage?: string; message?: string }

export const useLoginMutation = () => {
  // 최신 스토어라면 setAccessToken/setUserFromToken이 있고,
  // 구버전이라면 setUser만 있을 수 있어 → 둘 다 안전하게 처리
  const { setUser } = useAuthStore()

  return useMutation<LoginResponseDTO, AxiosError<ErrorBody>, LoginPayload>({
    mutationFn: login,
    onSuccess: (data) => {
      const accessToken = data?.accessToken
      if (!accessToken) {
        console.warn('[LOGIN OK] but no accessToken in response body')
        return
      }

      // ✅ 토큰을 메모리(Zustand)에 저장 (인터셉터가 Bearer 자동 주입)
      if ('setAccessToken' in useAuthStore.getState()) {
        useAuthStore.getState().setAccessToken(accessToken)
      }

      // ✅ 유저 상태도 세팅 (신버전: 토큰으로 자동 파싱 / 구버전: 직접 파싱)
      if ('setUserFromToken' in useAuthStore.getState()) {
        useAuthStore.getState().setUserFromToken(accessToken)
      } else {
        const decoded = parseJwt<JwtPayload>(accessToken)
        if (decoded) {
          setUser({
            userId: decoded.userId,
            role: decoded.role,
            name: decoded.name,
            loginId: decoded.sub,
          })
        }
      }
    },
    onError: (err) => {
      console.warn('[LOGIN FAIL]', err.response?.status, err.response?.data)
    },
  })
}
