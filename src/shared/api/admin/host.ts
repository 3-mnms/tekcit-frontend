import {api} from '@/shared/api/axios';
import type {User} from '@/models/admin/User';
import type { NewHostData } from '@/components/operatManage/AddModal';

export const getHosts = async (searchTerm?: string): Promise<User[]> => {
    const response = await api.get<User>('/api/admin/hostList', {
    params: {
      search: searchTerm,
    },
  });
  return [response.data]; 
};

export const registerHost = async (newPartner: NewHostData): Promise<User> => {
    const response = await api.post<User>('/users/signupHost', newPartner);
    return response.data;
};