// components/common/Layout.tsx
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import SubHeader from './SubHeader'; // SubHeader 컴포넌트 불러오기, 삐약!
import { useNavigate } from 'react-router-dom';

const adminMenuItems = [
  { path: '/admin/events', name: '상품 등록', icon: '🎫' },
  { path: '/admin/users', name: '상품 관리', icon: '👥' },
  { path: '/admin/notices', name: '공지사항', icon: '📢' },
  { path: '/admin/operations', name: '운영 관리', icon: '⚙️' },
];

interface LayoutProps {
  children: React.ReactNode;
  subTitle: string; // 서브 헤더에 표시될 제목을 받습니다, 삐약!
}

const Layout: React.FC<LayoutProps> = ({ children, subTitle }) => { // subTitle prop 추가! 삐약!
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    alert('로그아웃 되었습니다, 삐약!');
    navigate('/login');
  };

  const currentUserName = '정혜영';
  const currentUserEmail = 'abc1234@test.com';
  const currentUserType = '주최자';

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        menuItems={adminMenuItems}
        userType={currentUserType}
        userName={currentUserName}
        userEmail={currentUserEmail}
      />
      <div
        className="flex flex-col flex-1"
        style={{ marginLeft: '250px' }}
      >
        <Header
          userName={currentUserName}
          onLogout={handleLogout}
        />
        <main className="flex-1 p-0 overflow-y-auto"> {/* main의 p-6 제거 (SubHeader와 children이 직접 패딩 가짐), 삐약! */}
          {/* SubHeader 렌더링! 삐약! */}
          <SubHeader title={subTitle} />
          {/* 실제 페이지 내용에 패딩을 다시 줍니다, 삐약! */}
          <div style={{ padding: '24px' }}> {/* p-6에 해당하는 패딩을 div로 감싸서 적용, 삐약! */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;