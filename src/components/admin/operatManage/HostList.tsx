import React from 'react';
import Table from '@/components/shared/Table';
import type { Column } from '@/components/shared/Table';
import ToggleSwitch from '@components/common/ToggleSwitch';
import type { User } from '../../../models/Host';

interface UserListProps {
    users: User[];
    onToggleStatus: (userId: string, currentIsActive: boolean) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onToggleStatus }) => {
    // 삐약! columns 배열에 타입을 명시적으로 지정해줍니다!
    const columns: Column<User>[] = [ // 삐약! 이 부분이 수정되었습니다!
        { id: 'name', label: '이름' },
        { id: 'userId', label: '아이디' },
        { id: 'phone', label: '전화번호' },
        { id: 'email', label: '이메일' },
        { id: 'genre', label: '장르' },
        { id: 'pw', label: '비밀번호', render: (user: User) => (
            user.pw ? `${user.pw.substring(0, 3)}****` : '********'
        )}, // 삐약! substring 오류를 수정했어요!
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