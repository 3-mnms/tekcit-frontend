// src/models/auth/tanstack-query/useLogin.ts
import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { login, type LoginPayload, type LoginResponseDTO } from '@/shared/api/auth/login'
import { tokenStore } from '@/shared/storage/tokenStore'
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
  const { setUser } = useAuthStore()

  return useMutation<LoginResponseDTO, AxiosError<ErrorBody>, LoginPayload>({
    mutationFn: login,
    onSuccess: (data) => {

      const accessToken = data?.accessToken

      if (!accessToken) {
        console.warn('[LOGIN OK] but no accessToken in response body')
      } else {
        tokenStore.set(accessToken)
        console.log('[TOKEN SET]', tokenStore.get()) 

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
