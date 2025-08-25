import { api } from '@/shared/api/axios';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

function unwrap<T>(res: ApiResponse<T>): T {
  if (res?.success) return res.data;
  throw new Error(res?.message || 'API response invalid');
}

export const signupUser = async (data: any) => {
  const res = await api.post('/users/signupUser', data);
  return res.data;
};

export const checkLoginId = async (loginId: string) => {
  const { data } = await api.get<ApiResponse<boolean>>(
    '/users/checkLoginId',
    { params: { loginId: loginId.trim() } } 
  );
  return unwrap(data); 
};

export const checkEmail = async (email: string) => {
  const { data } = await api.get<ApiResponse<boolean>>('/users/checkEmail', {
    params: { email: email.trim() }
  });
  return unwrap(data);
};

export const sendEmailCode = async (
  email: string,
  type: 'SIGNUP' | 'EMAIL_UPDATE' | 'PASSWORD_FIND' = 'SIGNUP'
) => {
  const { data } = await api.post('/mail/sendCode', { email, type }); // ✅ type 추가
  return data;
};

export const verifyEmailCode = async (
  email: string,
  code: string,
  type: 'SIGNUP' | 'EMAIL_UPDATE' | 'PASSWORD_FIND' = 'SIGNUP'
) => {
  const { data } = await api.post('/mail/verifyCode', { email, code, type }); // 이미 OK
  return data;
};

export async function deleteMyAccount() {
  const res = await api.delete('/users');
  return res.status;
}