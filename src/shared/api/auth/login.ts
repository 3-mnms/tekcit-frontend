import { api } from '@/shared/api/axios';

export interface LoginPayload {
  loginId: string;
  loginPw: string;
}

export const login = async (payload: LoginPayload) => {
  const { data } = await api.post('/users/login', payload);
  return data; // LoginResponseDTO
};

export const logout = async () => {
  await api.post('/users/logout');
};

export const reissue = async () => {
  const { data } = await api.post('/users/reissue');
  return data;
};
