// components/common/Layout.tsx
import React, { useState, useEffect } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import SubHeader from './SubHeader'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/models/auth/useAuth'
import { USERROLE } from '@/models/admin/host/User'

const adminMenuItems = [
  { path: '/admin/productRegist', name: '상품 등록' },
  { path: '/admin/productManage', name: '상품 관리' },
  { path: '/admin/announcement', name: '공지사항' },
  {
    name: '운영 관리',
    subMenu: [
      { path: '/admin/operatManage/host', name: '주최자' },
      { path: '/admin/operatManage/user', name: '사용자' },
    ],
  },
]

interface LayoutProps {
  children: React.ReactNode
  subTitle: string
}

const Layout: React.FC<LayoutProps> = ({ children, subTitle }) => {
  const navigate = useNavigate()
  const { name, email, role } = useAuth()

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    alert('로그아웃 되었습니다')
    navigate('/login')
  }

  const [sidebarWidth, setSidebarWidth] = useState('18%')
  const minSidebarWidth = 150

  useEffect(() => {
    const handleResize = () => {
      const dynamicWidth = window.innerWidth * 0.18
      if (dynamicWidth < minSidebarWidth) {
        setSidebarWidth(`${minSidebarWidth}px`)
      } else {
        setSidebarWidth('18%')
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const headerHeight = '10vh'
  const subHeaderHeight = '5vh'

  const filteredMenuItems = adminMenuItems.filter(item => {
    if (role === USERROLE.HOST) {
      return item.name === '상품 등록' || item.name === '상품 관리' || item.name === '공지사항'
    }
    return true 
  })

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        menuItems={filteredMenuItems}
        userName={name}
        userEmail={email}
        style={{ width: sidebarWidth }}
      />
      <Header userName={name} onLogout={handleLogout} />

      {/* 페이지 자리*/}
      <div
        style={{
          marginLeft: sidebarWidth,
          marginTop: headerHeight,
          width: `calc(100% - ${sidebarWidth})`,
          height: `calc(100vh - ${headerHeight})`,
        }}
        className="flex flex-col"
      >
        <div>
          <SubHeader title={subTitle} />
        </div>
        <main
          className="flex-1"
          style={{
            padding: '10px',
            overflowY: 'auto',
            height: `calc(100vh - ${headerHeight} - ${subHeaderHeight})`,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
