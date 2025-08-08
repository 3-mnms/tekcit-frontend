import { useMutation } from '@tanstack/react-query';
import { login, type LoginPayload } from '@/shared/api/auth/login';
import { tokenStore } from '@/shared/storage/tokenStore';

export const useLoginMutation = () =>
  useMutation({
    mutationFn: login,
    onSuccess: (data: any) => {
      console.log('[LOGIN OK] response:', data);
      if (data?.accessToken) {
        tokenStore.set(data.accessToken);
        console.log('[TOKEN SET]', tokenStore.get()?.slice(0, 20), '...');
      } else {
        console.warn('[LOGIN OK] but no accessToken in body');
      }
    },
  });