import axios from 'axios';
import type { User, UserRole } from '@/models/User';
import type { NewHostData } from '@/components/operatManage/AddModal';

export const getHosts = async (searchTerm: string, role: UserRole, userId?: number): Promise<User[]> => {
    const response = await axios.get<User[]>('/api/users/signupHost', {
        params: {
            searchTerm,
            role,
            userId,
        }
    });
    return response.data;
};

export const registerHost = async (newPartner: NewHostData): Promise<User> => {
    const response = await axios.post<User>('/api/users/signupHost', newPartner);
    return response.data;
};