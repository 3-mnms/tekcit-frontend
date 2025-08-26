import {api} from '@/shared/api/axios';
import type {User} from '@/models/admin/User';
import type { NewHostData } from '@/components/operatManage/AddModal';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const getHosts = async (searchTerm?: string): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>('/admin/hostList', {
    params: {
      search: searchTerm,
    },
  });
  return response.data.data || []; 
};
export const registerHost = async (newPartner: NewHostData): Promise<User> => {
    const response = await api.post<User>('/users/signupHost', newPartner);
    return response.data;
};

export const toggleHostStatus = async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
  await api.patch(`/admin/${userId}/state`, null, {
    params: {
      active: isActive,
    },
  });
};