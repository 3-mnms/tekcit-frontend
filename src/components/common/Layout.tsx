// components/common/Layout.tsx
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import SubHeader from './SubHeader';
import { useNavigate } from 'react-router-dom';

const adminMenuItems = [
{ path: "/productRegist", name: "상품 등록" },
{ path: "/productManage", name: "상품 관리" },
{ path: "/announcement", name: "공지사항" },
{ name: "운영 관리", subMenu: [
    {path: "/operatManage/host", name: "주최자"},
    {path: "/operatManage/user", name: "사용자"},
]}
];

interface LayoutProps {
  children: React.ReactNode;
  subTitle: string;
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

  const [sidebarWidth, setSidebarWidth] = useState('18%');
  const minSidebarWidth = 150;

  useEffect(() => {
    const handleResize = () => {
      const dynamicWidth = window.innerWidth * 0.18;
      if (dynamicWidth < minSidebarWidth) {
        setSidebarWidth(`${minSidebarWidth}px`);
      } else {
        setSidebarWidth('18%');
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const headerHeight = '10vh';

 return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        menuItems={adminMenuItems}
        userName={currentUserName}
        userEmail={currentUserEmail}
        style={{ width: sidebarWidth }}
      />
      <Header
        userName={currentUserName}
        onLogout={handleLogout}
      />

      {/* 페이지 자리*/}
      <div 
        style={{
          marginLeft: sidebarWidth,
          marginTop: headerHeight,
          width: `calc(100% - ${sidebarWidth})`,
          height: `calc(100vh - ${headerHeight})`,
          overflowY: 'auto',
        }}
        className="flex flex-col"
      >
        <SubHeader title={subTitle} />
        
        <main className="flex-1" style={{ padding: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;