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
    mutationFn: async (body: KakaoSignupDTO) => {
      const res = await fetch('http://localhost:8080/api/auth/kakao/signupUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || `HTTP ${res.status}`);
      }
      return res.json(); // UserResponseDTO
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