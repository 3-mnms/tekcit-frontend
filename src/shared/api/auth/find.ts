// src/shared/api/user/UserApi.ts
import { api } from '@/shared/config/axios';

export interface ApiSuccess<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiErrorPayload {
  errorCode?: string;
  errorMessage?: string;
  message?: string;
  error?: string;
  success?: boolean;
}

export interface FindLoginIdDTO {
  name: string;
  email: string;
}

export interface FindPwEmailDTO {
  loginId: string;
  name: string;
}

export interface FindPwResetDTO {
  loginId: string;
  email: string;
  loginPw: string;
}

export async function postFindLoginId(body: FindLoginIdDTO) {
  const { data } = await api.post<ApiSuccess<string>>('/users/findLoginId', body);
  return data.data; 
}

export async function postFindRegisteredEmail(body: FindPwEmailDTO) {
  const { data } = await api.post<ApiSuccess<string>>('/users/findRegisteredEmail', body);
  return data.data; 
}

export async function patchResetPasswordWithEmail(body: FindPwResetDTO) {
  await api.patch<ApiSuccess<void>>('/users/resetPasswordWithEmail', body);
}

export type VerificationType = 'SIGNUP' | 'EMAIL_UPDATE' | 'PASSWORD_FIND';

export async function sendEmailCode(email: string, type: VerificationType) {
  const { data } = await api.post('/mail/sendCode', { email, type });
  return data; 
}

export async function verifyEmailCode(email: string, code: string, type: VerificationType) {
  const { data } = await api.post('/mail/verifyCode', { email, code, type });
  return data;
}