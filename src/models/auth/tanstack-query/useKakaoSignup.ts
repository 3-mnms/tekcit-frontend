// src/models/auth/tanstack-query/useKakaoSignup.ts
import { useMutation } from '@tanstack/react-query';
import type { KakaoSignupDTO } from '@/models/auth/schema/kakaoSignupSchema';
import { api } from '@/shared/api/axios'; // axios 인스턴스(쿠키 포함 설정)

export function useKakaoSignupMutation() {
  return useMutation({
    mutationFn: async (body: KakaoSignupDTO) => {
      const res = await api.post('/api/auth/kakao/signupUser', body, {
        // HttpOnly 쿠키 자동 첨부되도록 axios에 withCredentials:true 사전 설정 필수!
      });
      return res.data; // UserResponseDTO
    },
  });
}
