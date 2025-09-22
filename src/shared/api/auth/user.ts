import { api } from '@/shared/config/axios';

export const signupUser = async (data: any) => {
  const res = await api.post('/users/signupUser', data);
  return res.data;
};

export const checkLoginId = async (loginId: string) => {
  const res = await api.get(`/users/checkLoginId?loginId=${loginId}`);
  return Boolean(res.data?.data);
};

export const checkEmail = async (email: string) => {
  const res = await api.get(`/users/checkEmail?email=${email}`);
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

export const postCheckPassword = async (pw: string): Promise<void> => {
  await api.post('/myPage/checkPassword', { loginPw: pw })
}

export const patchResetPassword = async (pw: string): Promise<void> => {
  await api.patch('/myPage/resetPassword', { loginPw: pw })
}