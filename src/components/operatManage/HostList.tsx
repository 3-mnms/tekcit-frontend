import React from 'react';
import Table, {type Column} from '@/components/shared/Table';
import ToggleSwitch from '@/components/operatManage/ToggleSwitch';
import { USERROLE, type User } from '@/models/User';

interface HostListProps  {
    users: User[];
    onToggleStatus: (userId: string, currentIsActive: boolean) => void;
}

const HostList: React.FC<HostListProps > = ({ users, onToggleStatus }) => {
    const handleToggleStatus = (user: User, currentIsActive: boolean) => {
        onToggleStatus(user.loginId, currentIsActive);
    };
    
    const columns: Column<User>[] = [ 
        { columnId: 'name', label: '이름' },
        { columnId: 'loginId', label: '아이디' },
        { columnId: 'phone', label: '전화번호' },
        { columnId: 'email', label: '이메일' },
        { columnId: 'hostProfile', label: '장르', render: (user) => user.hostProfile?.genre },
        { columnId: 'hostProfile', label: '사업자명', render: (user) => user.hostProfile?.businessName },
        { columnId: 'loginPw', label: '비밀번호', render: (user) => (
            user.loginPw ? `${user.loginPw.substring(0, 3)}****` : '********'
        )},
        { columnId: 'hostProfile', label: '계정 상태', render: (user) => (
            user.role === USERROLE.HOST ? (
                <ToggleSwitch 
                    isActive={user.hostProfile.isActive}
                    onChange={() => handleToggleStatus(user, user.hostProfile.isActive)}
                />
            ) : (
                <span>-</span>
            )
        )},
    ];

    return <Table columns={columns} data={users} />;
};

export default HostList;