import React from 'react';
import Table from '@/components/shared/Table';
import type { Column } from '@/components/shared/Table';
import ToggleSwitch from '@/components/admin/operatManage/ToggleSwitch';
import type { User } from '../../../models/Host';

interface UserListProps {
    users: User[];
    onToggleStatus: (userId: string, currentIsActive: boolean) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onToggleStatus }) => {
    const columns: Column<User>[] = [ 
        { id: 'name', label: '이름' },
        { id: 'userId', label: '아이디' },
        { id: 'phone', label: '전화번호' },
        { id: 'email', label: '이메일' },
        { id: 'genre', label: '장르' },
        { id: 'pw', label: '비밀번호', render: (user: User) => (
            user.pw ? `${user.pw.substring(0, 3)}****` : '********'
        )},
        { id: 'businessName', label: '사업자명' },
        { id: 'isActive', label: '계정 상태', render: (user: User) => (
            <ToggleSwitch 
                isActive={user.isActive}
                onChange={() => onToggleStatus(user.userId, user.isActive)}
            />
        )},
    ];

    return <Table columns={columns} data={users} />;
};

export default UserList;