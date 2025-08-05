import React, { useState } from 'react';
import SearchBar from '@components/admin/SearchBox';
import UserList from '@components/admin/operatManage/UserList';
// import Button from '@components/common/Button';
import styles from './OperatManageUser.module.css';
import Layout from '@components/common/Layout';

const OperatManageUserPage: React.FC = () => {
    // 삐약! 원본 데이터를 allUsers에 저장합니다!
    const [users, setUsers] = useState([
        { id: 1, name: '김철수', userId: 'kimcs', phone: '010-1111-2222', email: 'kimcs@test.com', genre: '뮤지컬', businessName: '뮤지컬 컴퍼니', password: 'password1', isActive: true },
        { id: 2, name: '이영희', userId: 'leeyh', phone: '010-3333-4444', email: 'leeyh@test.com', genre: '콘서트', businessName: '콘서트 밴드', password: 'password2', isActive: true},
        { id: 3, name: '박민지', userId: 'parkmj', phone: '010-5555-6666', email: 'parkmj@test.com', genre: '전시회', businessName: '전시회 그룹', password: 'password3', isActive: true },
        { id: 4, name: '변백현', userId: 'bbh', phone: '010-1111-2222', email: 'kimcs@test.com', genre: '뮤지컬', businessName: '뮤지컬 컴퍼니', password: 'password1', isActive: true },
        { id: 5, name: '김민정', userId: 'kimmj', phone: '010-3333-4444', email: 'leeyh@test.com', genre: '콘서트', businessName: '콘서트 밴드', password: 'password2', isActive: true},
        { id: 6, name: '박민수', userId: 'parkms', phone: '010-5555-6666', email: 'parkmj@test.com', genre: '전시회', businessName: '전시회 그룹', password: 'password3', isActive: true },
        { id: 7, name: '김철정', userId: 'kimcj', phone: '010-1111-2222', email: 'kimcs@test.com', genre: '뮤지컬', businessName: '뮤지컬 컴퍼니', password: 'password1', isActive: true },
        { id: 8, name: '이영주', userId: 'leeyj', phone: '010-3333-4444', email: 'leeyh@test.com', genre: '콘서트', businessName: '콘서트 밴드', password: 'password2', isActive: true},
        { id: 9, name: '박민훈', userId: 'parkmh', phone: '010-5555-6666', email: 'parkmj@test.com', genre: '전시회', businessName: '전시회 그룹', password: 'password3', isActive: true },
    ]);

    const [searchTerm, setSearchTerm] = useState('');

    // 삐약! allUsers를 검색어에 따라 필터링합니다!
    const filteredUsers = users.filter(user =>
        user.name.includes(searchTerm) ||
        user.userId.includes(searchTerm) ||
        user.email.includes(searchTerm) ||  
                user.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.businessName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggleStatus = (userId: string, currentIsActive: boolean) => {
            const newIsActive = !currentIsActive;
            if (window.confirm(`삐약! ${userId} 계정을 ${newIsActive ? '활성화' : '정지'}하시겠습니까?`)) {
                // 삐약! API 호출이 성공했다고 가정하고, 화면을 업데이트합니다!
                setUsers(prevUsers => 
                    prevUsers.map(user => 
                        user.userId === userId ? { ...user, isActive: newIsActive } : user
                    )
                );
            }
        };

    // 삐약! 총 사용자 수도 필터링된 목록의 길이로 바꿔줍니다!
    const totalUsers = filteredUsers.length;

    // const handleAddUser = () => {
    //     alert('삐약! 파트너 추가 버튼 클릭!');
    // };

    return (
        <Layout subTitle="파트너 목록"> 
            <div className={styles.container}>
                <div className={styles.header}>
                    <h3 className={styles.totalUsersText}>전체 사용자 {totalUsers}명</h3>
                    <div className={styles.controls}>
                        {/* 삐약! SearchBar 컴포넌트에 필요한 props를 전달해줍니다! */}
                        <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
                        {/* <Button onClick={handleAddUser}>파트너 추가</Button> */}
                    </div>
                </div>
                <div className={styles.tableSection}>
                    <UserList users={filteredUsers} onToggleStatus={handleToggleStatus} />
                </div>
            </div>
        </Layout>
    );
};

export default OperatManageUserPage;