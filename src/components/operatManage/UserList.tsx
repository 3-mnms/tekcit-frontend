import React from 'react';
import Table from '@/components/shared/Table';
import type { Column } from '@/components/shared/Table';
import ToggleSwitch from '@/components/operatManage/ToggleSwitch';
import AddressDropdown from '@/components/operatManage/AddressDropdown';
import type { User } from '@/models/User';

interface UserListProps {
    users: User[];
    onToggleStatus: (userId: string, currentIsActive: boolean) => void;
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
        { columnId: 'address', label: '주소', render: (user: User) => (
            <AddressDropdown addresses={user.address} /> // 드롭다운
        )},
        { columnId: 'pw', label: '비밀번호', render: (user: User) => (
            user.pw ? `${user.pw.substring(0, 3)}****` : '********'
        )},
        { columnId: 'isActive', label: '계정 상태', render: (user: User) => (
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