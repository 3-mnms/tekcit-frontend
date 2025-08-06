import React from 'react';
import Table from '@/components/shared/Table';
import type { Column } from '@/components/shared/Table';
import ToggleSwitch from '@/components/admin/operatManage/ToggleSwitch';
import AddressDropdown from '@/components/admin/operatManage/AddressDropdown';
import type { User } from '../../../models/User';

interface UserListProps {
    users: User[];
    onToggleStatus: (userId: string, currentIsActive: boolean) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onToggleStatus }) => {
    const columns: Column<User>[] = [
        { id: 'name', label: '이름' },
        { id: 'loginId', label: '로그인 ID' },
        { id: 'phone', label: '전화번호' },
        { id: 'email', label: '이메일' },
        { id: 'birth', label: '생년월일' },
        { id: 'gender', label: '성별' },
        { id: 'address', label: '주소', render: (user: User) => (
            <AddressDropdown addresses={user.address} /> // 드롭다운
        )},
        { id: 'pw', label: '비밀번호', render: (user: User) => (
            user.pw ? `${user.pw.substring(0, 3)}****` : '********'
        )},
        { id: 'isActive', label: '계정 상태', render: (user: User) => (
            <ToggleSwitch 
                isActive={user.isActive}
                onChange={() => onToggleStatus(user.loginId, user.isActive)}
            />
        )},
    ];
    return (
        <div>
            <Table columns={columns} data={users} />
        </div>
    );
};

export default UserList;