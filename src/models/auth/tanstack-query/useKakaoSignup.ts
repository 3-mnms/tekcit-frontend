// src/models/auth/tanstack-query/useKakaoSignup.ts
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { postKakaoSignup, type ApiErrorPayload } from '@/shared/api/auth/kakao';
import type { KakaoSignupDTO } from '@/models/auth/schema/kakaoSignupSchema';

export function useKakaoSignupMutation():
  UseMutationResult<unknown, AxiosError<ApiErrorPayload>, KakaoSignupDTO> {
  return useMutation({
    mutationFn: postKakaoSignup,
    onError: (err) => {
      const data = err.response?.data;
      console.error('[KakaoSignup] error:', data?.success ?? err);
      alert("해당 이메일은 가입된 계정이 있습니다.")
    },
  });
}