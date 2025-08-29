// src/models/user/tanstack-query/usePassword.ts
import { useMutation } from '@tanstack/react-query'
import { postCheckPassword, patchResetPassword } from '@/shared/api/auth/user'

export const useCheckPasswordMutation = () => {
  return useMutation({
    mutationFn: (loginPw: string) => postCheckPassword(loginPw),
  })
}

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: (loginPw: string) => patchResetPassword(loginPw),
  })
}
