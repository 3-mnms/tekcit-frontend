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
      const msg =
        data?.errorMessage ??
        data?.message ??
        data?.error ??
        err.message ??
        '요청이 올바르지 않아요';
      console.error('[KakaoSignup] error:', err.response ?? err);
      alert(msg);
    },
  });
}