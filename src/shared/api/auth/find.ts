// src/shared/api/user/UserApi.ts
import { api } from '@/shared/api/axios';

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

/** 마이페이지 유저 정보: GET /users/myPage/userInfo (서버에서 사용자 식별) */
export async function getMyPageUserInfo<T = unknown>() {
  const { data } = await api.get<ApiSuccess<T>>('/users/myPage/userInfo');
  return data.data;
}

/** 마이페이지 회원 정보 수정: POST /users/updateUser */
export async function postUpdateUser<TReq extends object>(body: TReq) {
  await api.post<ApiSuccess<void>>('/users/updateUser', body);
}
/** 회원 탈퇴: DELETE /users (리프레시 쿠키 삭제됨) */
export async function deleteUserAccount() {
  await api.delete('/users');
}