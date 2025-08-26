import {type User} from '@/models/admin/User';
import { api } from '../axios';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const getUsers = async (searchTerm?: string): Promise<User[]> => {
  const response = await api.get<ApiResponse<User[]>>('/admin/userList', {
    params: {
      search: searchTerm,
    },
  });
  return response.data.data || [];
};


export const toggleHostStatus = async ({ userId, isActive }: { userId: number; isActive: boolean }) => {
  await api.patch(`/admin/${userId}/state`, null, {
    params: {
      active: isActive,
    },
  });
};