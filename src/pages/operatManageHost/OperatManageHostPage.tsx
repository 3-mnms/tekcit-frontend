import React, { useState } from 'react';
import SearchBar from '@/components/common/SearchBox';
import HostList from '@/components/operatManage/HostList';
import Button from '@/components/common/Button';
import styles from './OperatManageHost.module.css';
import Layout from '@components/layout/Layout';
import AddModal from '@/components/operatManage/AddModal';
import type {NewHostData} from '@/components/operatManage/AddModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHosts, registerHost } from '@/shared/api/admin/host';

const OperatManageHostPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 삐약! useQuery 훅을 사용해 호스트 목록을 가져옵니다!
    const { data: hosts, isLoading, isError, isFetching } = useQuery({
        queryKey: ['hosts', searchTerm],
        queryFn: () => getHosts(searchTerm),
    });
    
    // 삐약! useMutation 훅을 사용해 호스트를 등록합니다!
    const { mutate: registerHostMutation, isPending: isRegistering } = useMutation({
        mutationFn: (newHostData: NewHostData) => registerHost(newHostData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hosts'] });
            alert('호스트가 성공적으로 등록되었습니다!');
            setIsModalOpen(false);
        },
        onError: (error) => {
            console.error('호스트 등록 실패:', error);
            alert('호스트 등록에 실패했습니다.');
        },
    });

    const handleToggleStatus = (userId: string, currentIsActive: boolean) => {
        const newIsActive = !currentIsActive;
        console.log(`${userId} 계정을 ${newIsActive ? '활성화' : '정지'}하시겠습니까?`);
    
    // 예시: API 호출
    // useMutation 훅을 이용해 계정 상태 변경 API를 호출하는 로직이 들어갈 수 있어요.
    // toggleHostStatusMutation.mutate({ userId, newIsActiveStatus });
    };

    const handleSaveHost = (newHost: NewHostData) => {
        registerHostMutation(newHost);
    };

    const totalUsers = hosts ? hosts.length : 0;

    // 삐약! 로딩 및 에러 상태를 처리하는 UI를 추가합니다!
    if (isLoading) {
        return <Layout subTitle="주최자 목록"><div>삐약! 주최자 목록을 불러오는 중...</div></Layout>;
    }

    if (isError) {
        return <Layout subTitle="주최자 목록"><div>삐약! 오류가 발생했어요. 다시 시도해 주세요.</div></Layout>;
    }
    return (
        <Layout subTitle="주최자 목록"> 
            <div className={styles.container}>
                <div className={styles.header}>
                    <h3 className={styles.totalUsersText}>전체 주최자 {totalUsers}명</h3>
                    <div className={styles.controls}>
                        <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
                        <Button onClick={() => setIsModalOpen(true)}>파트너 추가</Button>
                    </div>
                </div>
                {isFetching && <div className={styles.loadingIndicator}>주최자 목록을 가져오는 중...</div>}
                <div className={styles.tableSection}>
                    <HostList users={hosts || []} onToggleStatus={handleToggleStatus} />
                </div>
            </div>
            <AddModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveHost}
                isPending={isRegistering} 
            />
        </Layout>
    );
};

export default OperatManageHostPage;