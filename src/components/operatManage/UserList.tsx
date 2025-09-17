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
        { columnId: 'name', label: '이름' , style: { width: '10%' }},
        { columnId: 'loginId', label: '로그인 ID', style: { width: '10%' }, render: (user) => (
                <span>{user.loginId === null ? 'KAKAO' : user.loginId}</span>
            ),
        },
        { columnId: 'phone', label: '전화번호', style: { width: '11%' }},
        { columnId: 'email', label: '이메일', style: { width: '18%' } },
        { columnId: 'residentNum', label: '주민번호', style: { width: '7%'}},
        { columnId: 'birth', label: '생년월일', style: { width: '7%'}},
        { columnId: 'gender', label: '성별', style: { width: '7%' }},
        { columnId: 'addresses', label: '주소', style: { width: '20%' }, render: (user) => {
            return <AddressDropdown addresses={user.addresses || []} />;
        }
    },
        { columnId: 'active', label: '계정 상태', style: { width: '7%' }, render: (user) => (
            <ToggleSwitch 
                isActive={user.active ?? false}
                onChange={() => onToggleStatus(user.userId, user.active ?? false)}
            />
        )},
    ];
    return <Table columns={columns} data={users|| []} getUniqueKey={(item) => item.userId} />;
};

export default UserList;