// src/models/auth/tanstack-query/useLogin.ts
import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { login, type LoginPayload, type LoginResponseDTO } from '@/shared/api/auth/login'
import { tokenStore } from '@/shared/storage/tokenStore'

export const useLoginMutation = () =>
  useMutation<LoginResponseDTO, AxiosError, LoginPayload>({
    mutationFn: login,
    onSuccess: (data) => {
      tokenStore.set(data.accessToken)
      console.log('[TOKEN SET]', JSON.stringify(tokenStore.get()));
    },
    onError: (err) => {
      console.warn('[LOGIN FAIL]', err.response?.status, err.response?.data)
    },
  })