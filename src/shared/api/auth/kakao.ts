// src/shared/api/auth/kakao.ts
import { api } from '@/shared/config/axios';
import type { KakaoSignupDTO } from '@/models/auth/schema/kakaoSignupSchema';

export interface ApiErrorPayload {
  errorCode?: string;
  errorMessage?: string;
  message?: string;
  error?: string;
  success?: boolean;
}

export async function postKakaoSignup(body: KakaoSignupDTO) {
  const { data } = await api.post('/auth/kakao/signupUser', body);
  return data; // UserResponseDTO
}
