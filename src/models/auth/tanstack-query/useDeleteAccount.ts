// src/models/auth/tanstack-query/useDeleteAccount.ts
import { useMutation } from '@tanstack/react-query';
import { deleteMyAccount } from '@/shared/api/auth/user';

export function useDeleteAccountMutation() {
  return useMutation({
    mutationFn: () => deleteMyAccount(),
  });
}
