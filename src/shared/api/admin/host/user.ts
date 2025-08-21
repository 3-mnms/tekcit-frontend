import { USERROLE, type User} from '@/models/admin/host/User';
import { MOCK_USERS } from '@/models/dummy/mockUsers';

export const getUsers = async (searchTerm?: string): Promise<User[]> => {
    let filteredUsers = MOCK_USERS;

    filteredUsers = filteredUsers.filter(user => user.role === USERROLE.USER);
    
    if (searchTerm) {
        filteredUsers = filteredUsers.filter(user =>
            user.name.includes(searchTerm) ||
            user.loginId.includes(searchTerm) ||
            user.email.includes(searchTerm) ||
            user.phone.includes(searchTerm)
        );
    }
    return filteredUsers;
};