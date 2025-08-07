import React, { useState } from 'react';
import SearchBar from '@/components/common/SearchBox';
import UserList from '@/components/operatManage/HostList';
import Button from '@/components/common/Button';
import styles from './OperatManageHost.module.css';
import Layout from '@components/layout/Layout';
import AddPartner from '@/components/operatManage/AddModal';
import type {NewPartnerData} from '@/components/operatManage/AddModal';
import type { User } from '@/models/Host';

const MOCK_PARTNERS: User[] = [
        { id: 1, name: '김철수', userId: 'kimcs', phone: '010-1111-2222', email: 'kimcs@test.com', genre: '뮤지컬', businessName: '뮤지컬 컴퍼니', pw: 'password1', isActive: true },
        { id: 2, name: '이영희', userId: 'leeyh', phone: '010-3333-4444', email: 'leeyh@test.com', genre: '콘서트', businessName: '콘서트 밴드', pw: 'password2', isActive: true},
        { id: 3, name: '박민지', userId: 'parkmj', phone: '010-5555-6666', email: 'parkmj@test.com', genre: '전시회', businessName: '전시회 그룹', pw: 'password3', isActive: true },
        { id: 4, name: '변백현', userId: 'bbh', phone: '010-1111-2222', email: 'kimcs@test.com', genre: '뮤지컬', businessName: '뮤지컬 컴퍼니', pw: 'password1', isActive: true },
        { id: 5, name: '김민정', userId: 'kimmj', phone: '010-3333-4444', email: 'leeyh@test.com', genre: '콘서트', businessName: '콘서트 밴드', pw: 'password2', isActive: true},
        { id: 6, name: '박민수', userId: 'parkms', phone: '010-5555-6666', email: 'parkmj@test.com', genre: '전시회', businessName: '전시회 그룹', pw: 'password3', isActive: true },
        { id: 7, name: '김철정', userId: 'kimcj', phone: '010-1111-2222', email: 'kimcs@test.com', genre: '뮤지컬', businessName: '뮤지컬 컴퍼니', pw: 'password1', isActive: true },
        { id: 8, name: '이영주', userId: 'leeyj', phone: '010-3333-4444', email: 'leeyh@test.com', genre: '콘서트', businessName: '콘서트 밴드', pw: 'password2', isActive: true},
        { id: 9, name: '박민훈', userId: 'parkmh', phone: '010-5555-6666', email: 'parkmj@test.com', genre: '전시회', businessName: '전시회 그룹', pw: 'password3', isActive: true },
    ];

const OperatManageHostPage: React.FC = () => {
    // 삐약! 원본 데이터를 allUsers에 저장합니다!
    const [users, setUsers] = useState<User[]>(MOCK_PARTNERS);
    const [searchTerm, setSearchTerm] = useState('');
    // 삐약! 모달의 열림/닫힘 상태를 관리합니다!
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 삐약! allUsers를 검색어에 따라 필터링합니다!
    const filteredUsers = users.filter(user =>
        user.name.includes(searchTerm) ||
        user.userId.includes(searchTerm) ||
        user.email.includes(searchTerm) ||
        user.genre?.toLowerCase().includes(searchTerm.toLowerCase()) || // 삐약! genre가 없을 수도 있으니 안전하게 ?. 을 사용합니다!
        user.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggleStatus = (userId: string, currentIsActive: boolean) => {
            const newIsActive = !currentIsActive;
            if (window.confirm(`${userId} 계정을 ${newIsActive ? '활성화' : '정지'}하시겠습니까?`)) {
                setUsers(prevUsers => 
                    prevUsers.map(user => 
                        user.userId === userId ? { ...user, isActive: newIsActive } : user
                    )
                );
            }
        };

        const handleAddUser = () => {
        setIsModalOpen(true); // 삐약! 버튼을 누르면 모달을 엽니다!
    };

    const handleSavePartner = (newPartner: NewPartnerData) => {
        // 삐약! 여기서는 더미 데이터에 새 파트너를 추가합니다.
        // 삐약! 실제로는 API를 호출해서 데이터베이스에 저장해야 합니다!
        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        const newUser: User = {
            id: newId,
            name: newPartner.name,
            userId: newPartner.userId,
            phone: newPartner.phone,
            email: newPartner.email,
            genre: newPartner.genre,
            businessName: newPartner.businessName,
            pw: newPartner.pw,
            isActive: true,
        };
        setUsers(prevUsers => [...prevUsers, newUser]);
        alert('삐약! 파트너가 성공적으로 추가되었습니다!');
    };

    const totalUsers = filteredUsers.length;

    return (
        <Layout subTitle="주최자 목록"> 
            <div className={styles.container}>
                <div className={styles.header}>
                    <h3 className={styles.totalUsersText}>전체 주최자 {totalUsers}명</h3>
                    <div className={styles.controls}>
                        <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
                        <Button onClick={handleAddUser}>파트너 추가</Button>
                    </div>
                </div>
                <div className={styles.tableSection}>
                    <UserList users={filteredUsers} onToggleStatus={handleToggleStatus} />
                </div>
            </div>
            <AddPartner
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSavePartner}
            />
        </Layout>
    );
};

export default OperatManageHostPage;