import React, { useMemo, useState } from 'react';
import SearchBar from '@/components/common/SearchBox';
import UserList from '@/components/operatManage/UserList';
import styles from './OperatManageUser.module.css';
import Layout from '@components/layout/Layout';
import { getUsers, toggleHostStatus } from '@/shared/api/admin/user'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Spinner from '@/components/common/spinner/Spinner';

const OperatManageUserPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();

    const { data: users, isLoading, isError} = useQuery({
        queryKey: ['users', searchTerm],
        queryFn: () => getUsers(),
    });

    const { mutate: toggleStatusMutation } = useMutation({
        mutationFn: toggleHostStatus,
        onSuccess: () => {
            // 성공하면 주최자 목록을 새로고침해서 변경된 상태를 바로 보여줘!
            queryClient.invalidateQueries({ queryKey: ['users'] });
            alert('계정 상태가 변경되었습니다.');
        },
        onError: (error) => {
            console.error('상태 변경 실패:', error);
            alert('계정 상태 변경에 실패했습니다.');
        },
    });

    const handleToggleStatus = (userId: number, currentIsActive: boolean) => {
        const newIsActive = !currentIsActive;
        if (window.confirm(`${userId} 계정을 ${newIsActive ? '활성화' : '정지'}하시겠습니까?`)) {
            toggleStatusMutation({ userId, isActive: newIsActive });
        }
    };

    const totalUsers = users ? users.length : 0;

    const filteredUsers = useMemo(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
        if (!users) return [];
        if (!lowercasedTerm) return users;

        return users.filter(user => {
            const userCondition = user.role === 'USER' && (
                user.name?.toLowerCase().includes(lowercasedTerm) ||
                user.email?.toLowerCase().includes(lowercasedTerm) ||
                user.loginId?.toLowerCase().includes(lowercasedTerm) ||
                user.phone?.toLowerCase().includes(lowercasedTerm) ||
                user.addresses?.some(addressItem =>
                    addressItem.address.toLowerCase().includes(lowercasedTerm)
                )
            );
            return userCondition;
        });
    }, [users, searchTerm]);
    
    if (isLoading) return <Spinner/>
    if (isError) return <Layout subTitle="사용자 목록"><div>에러 발생!</div></Layout>;

    return (
        <Layout subTitle="사용자 목록">
            <div className={styles.container}>
                <div className={styles.header}>
                    <h3 className={styles.totalUsersText}>전체 사용자 {totalUsers}명</h3>
                    <div className={styles.controls}>
                        <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
                    </div>
                </div>
                {/* {isFetching && <div className={styles.loadingIndicator}>사용자 목록을 가져오는 중...</div>} */}
                <div className={styles.tableSection}>
                    <UserList users={filteredUsers} onToggleStatus={handleToggleStatus}/>
                </div>
            </div>
        </Layout>
    );
};

export default OperatManageUserPage;