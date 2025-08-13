// src/models/auth/tanstack-query/useKakaoSignup.ts
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import type { KakaoSignupDTO } from '@/models/auth/schema/kakaoSignupSchema';
import { kakaoApi } from '@/shared/api/axios';
import type { AxiosError } from 'axios';

interface KakaoErrorResponse {
  errorCode?: string;
  errorMessage?: string;
  message?: string;
  error?: string;
  success?: boolean;
}

export function useKakaoSignupMutation():
  UseMutationResult<unknown, AxiosError<KakaoErrorResponse>, KakaoSignupDTO> {
  return useMutation<unknown, AxiosError<KakaoErrorResponse>, KakaoSignupDTO>({
    mutationFn: async (body) => {
      const res = await kakaoApi.post<unknown>('/api/auth/kakao/signupUser', body);
      return res.data;
    },
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