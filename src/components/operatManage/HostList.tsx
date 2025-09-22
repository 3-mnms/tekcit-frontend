import React from 'react';
import Table, {type Column} from '@/components/shared/Table';
import ToggleSwitch from '@/components/operatManage/ToggleSwitch';
import {type User } from '@/models/admin/User';

interface HostListProps  {
    users: User[];
    onToggleStatus: (userId: number, currentIsActive: boolean) => void;
    onSelectionChange?: (selectedIds: (string | number)[]) => void;
}

const HostList: React.FC<HostListProps > = ({ users, onToggleStatus, onSelectionChange}) => {
    const handleToggleStatus = (user: User, currentIsActive: boolean) => {
        onToggleStatus(user.userId, currentIsActive);
    };
    
    const columns: Column<User>[] = [ 
        { columnId: 'name', label: '이름' },
        { columnId: 'loginId', label: '아이디' },
        { columnId: 'phone', label: '전화번호' },
        { columnId: 'email', label: '이메일' },
        { columnId: 'businessName', label: '사업자명'},
        { columnId: 'active', label: '계정 상태', render: (user) => (
            <ToggleSwitch 
                isActive={user.active ?? false}
                onChange={() => handleToggleStatus(user, user.active ?? false)}
            />
        )},
    ];

    return <Table columns={columns} data={users|| []}  getUniqueKey={(item) => item.userId} isSelectable={true}  onSelectionChange={onSelectionChange} />;
};

export default HostList;