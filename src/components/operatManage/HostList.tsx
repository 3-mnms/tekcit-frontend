import React from 'react';
import Table from '@/components/shared/Table';
import type { Column } from '@/components/shared/Table';
import ToggleSwitch from '@/components/operatManage/ToggleSwitch';
import type { User } from '@/models/Host';

interface UserListProps {
    users: User[];
    onToggleStatus: (userId: string, currentIsActive: boolean) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onToggleStatus }) => {
    const columns: Column<User>[] = [ 
        { columnId: 'name', label: '이름' },
        { columnId: 'userId', label: '아이디' },
        { columnId: 'phone', label: '전화번호' },
        { columnId: 'email', label: '이메일' },
        { columnId: 'genre', label: '장르' },
        { columnId: 'pw', label: '비밀번호', render: (user: User) => (
            user.pw ? `${user.pw.substring(0, 3)}****` : '********'
        )},
        { columnId: 'businessName', label: '사업자명' },
        { columnId: 'isActive', label: '계정 상태', render: (user: User) => (
            <ToggleSwitch 
                isActive={user.isActive}
                onChange={() => onToggleStatus(user.userId, user.isActive)}
            />
        )},
    ];

    return <Table columns={columns} data={users} />;
};

export default UserList;