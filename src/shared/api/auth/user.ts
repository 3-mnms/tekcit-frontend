import axios from 'axios';

export const signupUser = async (data: any) => {
  const res = await axios.post('/api/users/signupUser', data);
  return res.data;
};

export const checkLoginId = async (loginId: string) => {
  const res = await axios.get(`/api/users/checkLoginId?loginId=${loginId}`);
  return res.data as boolean;
};

export const checkEmail = async (email: string) => {
  const res = await axios.get(`/api/users/checkEmail?email=${email}`);
  return res.data as boolean;
};

export const sendEmailCode = async (email: string) => {
  const res = await axios.post('/api/mail/sendCode', { email });
  return res.data;
};

export const verifyEmailCode = async (email: string, code: string) => {
  const res = await axios.post('/api/mail/verifyCode', { email, code, type: 'SIGNUP' });
  return res.data;
};