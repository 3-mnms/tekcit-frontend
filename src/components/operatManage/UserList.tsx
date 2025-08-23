import React from 'react';
import Table from '@/components/shared/Table';
import type { Column } from '@/components/shared/Table';
import ToggleSwitch from '@/components/operatManage/ToggleSwitch';
import AddressDropdown from '@/components/operatManage/AddressDropdown';
import { USERROLE, type User } from '@/models/admin/User';

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
        { columnId: 'userProfile.address', label: '주소', render: (user) => (
            <AddressDropdown addresses={user.userProfile?.address || []} />
        )},
        { columnId: 'loginPw', label: '비밀번호', render: (user) => (
            user.loginPw ? `${user.loginPw.substring(0, 3)}****` : '********'
        )},
        { columnId: 'userProfile.isActive', label: '계정 상태', render: (user) => (
            user.role === USERROLE.USER ? (
            <ToggleSwitch 
                isActive={user.userProfile?.isActive}
                onChange={() => onToggleStatus(user.loginId, user.userProfile?.isActive)}
            />
            ) : (
                <span>-</span>
            )
        )},
    ];
    return <Table columns={columns} data={users|| []} getUniqueKey={(item) => item.id} />;
};

export default UserList;