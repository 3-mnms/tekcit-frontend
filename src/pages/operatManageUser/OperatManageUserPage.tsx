import React, { useState } from 'react';
import SearchBar from '@/components/common/SearchBox';
import UserList from '@/components/operatManage/UserList';
import styles from './OperatManageUser.module.css';
import Layout from '@components/layout/Layout';
import type { User } from '@/models/User';

const MOCK_USERS: User[] = [
    {
        id: 1,
        name: '김철수',
        loginId: 'kimcs',
        phone: '010-1111-2222',
        email: 'kimcs@test.com',
        age: 30,
        residentNum: '940101-1******',
        birth: '1994.01.01',
        gender: 'male',
        address: [{ address: '서울시 강남구 역삼동', is_primary: true }, { address: '경기도 성남시 분당구', is_primary: false }],
        isActive: true,
    },
    {
        id: 2,
        name: '이영희',
        loginId: 'leeyh',
        phone: '010-3333-4444',
        email: 'leeyh@test.com',
        age: 25,
        residentNum: '990505-2******',
        birth: '1999.05.05',
        gender: 'female',
        address: [{ address: '부산시 해운대구', is_primary: true }],
        isActive: true,
    },
    {
        id: 3,
        name: '박민지',
        loginId: 'parkmj',
        phone: '010-5555-6666',
        email: 'parkmj@test.com',
        age: 28,
        residentNum: '960303-2******',
        birth: '1996.03.03',
        gender: 'female',
        address: [{ address: '대구시 중구', is_primary: false }, { address: '서울시 서초구', is_primary: true }],
        isActive: true,
    },
];

const OperatManageUserPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter(user =>
        user.name.includes(searchTerm) ||
        user.loginId.includes(searchTerm) ||
        user.email.includes(searchTerm) ||
        user.phone.includes(searchTerm)
    );

    const handleToggleStatus = (userId: string, currentIsActive: boolean) => {
        const newIsActive = !currentIsActive;
        if (window.confirm(`${userId} 계정을 ${newIsActive ? '활성화' : '정지'}하시겠습니까?`)) {
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.loginId === userId ? { ...user, isActive: newIsActive } : user
                )
            );
        }
    };

    const totalUsers = filteredUsers.length;

    return (
        <Layout subTitle="사용자 목록">
            <div className={styles.container}>
                <div className={styles.header}>
                    <h3 className={styles.totalUsersText}>전체 사용자 {totalUsers}명</h3>
                    <div className={styles.controls}>
                        <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
                    </div>
                </div>
                <div className={styles.tableSection}>
                    <UserList
                        users={filteredUsers}
                        onToggleStatus={handleToggleStatus}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default OperatManageUserPage;