import { useMutation } from '@tanstack/react-query';
import { login, type LoginPayload } from '@/shared/api/auth/login';

export const useLoginMutation = () =>
  useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
  });
