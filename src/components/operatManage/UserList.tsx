import React from 'react';
import Table, {type Column} from '@/components/shared/Table';
import ToggleSwitch from '@/components/operatManage/ToggleSwitch';
import AddressDropdown from '@/components/operatManage/AddressDropdown';
import { type User } from '@/models/admin/User';

interface UserListProps {
    users: User[];
    onToggleStatus: (userId: number, currentIsActive: boolean) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onToggleStatus }) => {
    const columns: Column<User>[] = [
        { columnId: 'name', label: '이름' },
        { columnId: 'loginId', label: '로그인 ID' },
        { columnId: 'phone', label: '전화번호' },
        { columnId: 'email', label: '이메일' },
        { columnId: 'residentNum', label: '주민번호' },
        { columnId: 'birth', label: '생년월일' },
        { columnId: 'gender', label: '성별' },
        { columnId: 'address', label: '주소', render: (user) => (
            <AddressDropdown addresses={user.addresses.address || []} />
        )},
        { columnId: 'active', label: '계정 상태', render: (user) => (
            <ToggleSwitch 
                isActive={user.active ?? false}
                onChange={() => onToggleStatus(user.userId, user.active ?? false)}
            />
        )},
    ];
    return <Table columns={columns} data={users|| []} getUniqueKey={(item) => item.userId} />;
};

export default UserList;