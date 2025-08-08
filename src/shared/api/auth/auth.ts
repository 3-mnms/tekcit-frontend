// src/shared/api/auth.ts
import axios from 'axios';
import type { SignupUserDTO } from '@/models/auth/auth';

export const signup = async (data: SignupUserDTO) => {
  const response = await axios.post('/api/users/signupUser', data);
  return response.data;
};