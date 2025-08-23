import axios from 'axios';
import { api } from '@/shared/api/axios';

export const signupUser = async (data: any) => {
  const res = await api.post('/users/signupUser', data);
  return res.data;
};

export const checkLoginId = async (loginId: string) => {
  const res = await api.get(`/api/users/checkLoginId?loginId=${loginId}`);
  return res.data as boolean;
};

export const checkEmail = async (email: string) => {
  const res = await axios.get(`/api/users/checkEmail?email=${email}`);
  return res.data as boolean;
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