import { api } from '@/shared/config/axios'
import { USERROLE, type User} from '@/models/admin/host/User';
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
  let filteredHosts = MOCK_HOSTS.filter((host) => host.role === USERROLE.HOST)

  if (searchTerm) {
    filteredHosts = filteredHosts.filter(
      (host) =>
        host.name.includes(searchTerm) ||
        host.loginId.includes(searchTerm) ||
        host.email.includes(searchTerm),
    )
  }

  return filteredHosts
}

// 새로운 호스트 등록 (실제 API 호출)
export const registerHost = async (newPartner: NewHostData): Promise<User> => {
  const { data } = await api.post<User>('/users/signupHost', newPartner)
  return data
}