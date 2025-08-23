import React, { useState } from 'react';
import SearchBar from '@/components/common/SearchBox';
import UserList from '@/components/operatManage/UserList';
import styles from './OperatManageUser.module.css';
import Layout from '@components/layout/Layout';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/shared/api/admin/user'

const OperatManageUserPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: users, isFetching } = useQuery({
            queryKey: ['users', searchTerm],
            queryFn: () => getUsers(searchTerm),
        });

    const handleToggleStatus = (userId: string, currentIsActive: boolean) => {
        const newIsActive = !currentIsActive;
        console.log(`${userId} 계정을 ${newIsActive ? '활성화' : '정지'}하시겠습니까?`);
        // api 연결 후 삭제
        // if (window.confirm(`${userId} 계정을 ${newIsActive ? '활성화' : '정지'}하시겠습니까?`)) {
        //     setUsers(prevUsers =>
        //         prevUsers.map(user =>
        //             user.loginId === userId ? { ...user, isActive: newIsActive } : user
        //         )
        //     );
        // }
    };

    const totalUsers = users ? users.length : 0;

    return (
        <Layout subTitle="사용자 목록">
            <div className={styles.container}>
                <div className={styles.header}>
                    <h3 className={styles.totalUsersText}>전체 사용자 {totalUsers}명</h3>
                    <div className={styles.controls}>
                        <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
                    </div>
                </div>
                {isFetching && <div className={styles.loadingIndicator}>사용자 목록을 가져오는 중...</div>}
                <div className={styles.tableSection}>
                    <UserList users={users || []} onToggleStatus={handleToggleStatus}/>
                </div>
            </div>
        </Layout>
    );
};

export default OperatManageUserPage;