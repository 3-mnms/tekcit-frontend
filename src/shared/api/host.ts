import axios from 'axios';
import { USERROLE, type User} from '@/models/User';
import type { NewHostData } from '@/components/operatManage/AddModal';
import { MOCK_HOSTS } from '@/models/dummy/mockHosts';

// export const getHosts = async (searchTerm: string, role: UserRole, userId?: number): Promise<User[]> => {
//     const response = await axios.get<User[]>('/api/users/signupHost', {
//         params: 
//             searchTerm,
//             role,
//             userId,
//         }
//     });
//   return response.data;
// };


export const getHosts = async (searchTerm?: string): Promise<User[]> => {
    let filteredHosts = MOCK_HOSTS;

    filteredHosts = filteredHosts.filter(host => host.role === USERROLE.HOST);
    
    if (searchTerm) {
        filteredHosts = filteredHosts.filter(host =>
            host.name.includes(searchTerm) ||
            host.loginId.includes(searchTerm) ||
            host.email.includes(searchTerm)
        );
    }
    return filteredHosts;
};

export const registerHost = async (newPartner: NewHostData): Promise<User> => {
    const response = await axios.post<User>('/api/users/signupHost', newPartner);
    return response.data;
};