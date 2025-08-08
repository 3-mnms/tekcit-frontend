import { useMutation } from '@tanstack/react-query';
import { logout } from '@/shared/api/auth/login';
import { tokenStore } from '@/shared/storage/tokenStore';

export const useLogoutMutation = () =>
  useMutation({
    mutationFn: logout,
    onSuccess: () => {
      tokenStore.clear(); // ✅ 프론트 access 제거 (시나리오 2/4)
    },
    onError: () => {
      // 에러여도 클라이언트 토큰은 비워주자
      tokenStore.clear();
    },
  });
