import React, { useState, useMemo  } from 'react';
import SearchBar from '@/components/common/SearchBox';
import HostList from '@/components/operatManage/HostList';
import Button from '@/components/common/Button';
import styles from './OperatManageHost.module.css';
import Layout from '@components/layout/Layout';
import AddModal from '@/components/operatManage/AddModal';
import type {NewHostData} from '@/components/operatManage/AddModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHosts, registerHost, toggleHostStatus, deleteHosts } from '@/shared/api/admin/host';

const OperatManageHostPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: hosts, isLoading, isError, isFetching } = useQuery({
        queryKey: ['hosts'],
        queryFn: () => getHosts(),
    });
    
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
    const handleSaveHost = (newHost: NewHostData) => {
        registerHostMutation(newHost);
    };
    
    const { mutate: toggleStatusMutation } = useMutation({
        mutationFn: toggleHostStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hosts'] });
            alert('계정 상태가 변경되었습니다.');
        },
        onError: (error) => {
            console.error('상태 변경 실패:', error);
            alert('계정 상태 변경에 실패했습니다.');
        },
    });

    const handleToggleStatus = (userId: number, currentIsActive: boolean) => {
        const newIsActive = !currentIsActive;
        if (window.confirm(`정말로 계정을 ${newIsActive ? '활성화' : '정지'}하시겠습니까?`)) {
            toggleStatusMutation({ userId, isActive: newIsActive });
        }
    };

    const { mutate: deleteHostsMutation, isPending: isDeleting } = useMutation({
        mutationFn: deleteHosts, // 우리가 만든 deleteHosts 함수를 사용!
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hosts'] });
            alert('선택한 항목이 삭제되었습니다.');
            setSelectedHostIds([]); // 성공하면 선택 상태를 초기화!
        },
        onError: (error) => {
            alert('삭제에 실패했습니다.');
            console.error('주최자 삭제 실패:', error);
        },
    });

    const handleDeleteSelected = () => {
        if (window.confirm(`정말로 ${selectedHostIds.length}개의 항목을 삭제하시겠습니까?`)) {
            deleteHostsMutation(selectedHostIds);
        }
    };

    const filteredHosts = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        if (!hosts) return []; // 데이터가 없으면 빈 배열 반환
        if (!lowercasedTerm) return hosts; // 검색어가 없으면 전체 목록 반환

        return hosts.filter(host => 
            host.name?.toLowerCase().includes(lowercasedTerm) ||
            host.email?.toLowerCase().includes(lowercasedTerm) ||
            host.loginId?.toLowerCase().includes(lowercasedTerm) ||
            host.businessName?.toLowerCase().includes(lowercasedTerm) ||
            host.phone?.toLowerCase().includes(lowercasedTerm)
        );
    }, [hosts, searchTerm]);

    const totalUsers = hosts ? hosts.length : 0;

    const [selectedHostIds, setSelectedHostIds] = useState<(string | number)[]>([]);

    const handleSelectionChange = (selectedIds: (string | number)[]) => {
        setSelectedHostIds(selectedIds);
    };

    if (isLoading) {
        return <Layout subTitle="주최자 목록"><div>주최자 목록을 불러오는 중...</div></Layout>;
    }

    if (isError) {
        return <Layout subTitle="주최자 목록"><div>오류가 발생했어요. 다시 시도해 주세요.</div></Layout>;
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
                    <HostList users={filteredHosts} onToggleStatus={handleToggleStatus} onSelectionChange={handleSelectionChange} />
                </div>
            </div>
             {selectedHostIds.length > 0 && (
                <div className={styles.floatingActionBar}>
                    <span className={styles.selectedCount}>
                        {selectedHostIds.length}개 선택됨
                    </span>
                    <Button onClick={handleDeleteSelected} variant="danger" disabled={isDeleting}>탈퇴하기</Button>
                </div>
            )}
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