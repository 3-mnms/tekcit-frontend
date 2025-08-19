import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from './Sidebar.module.css'

interface SidebarItem {
  label: string
  path: string
  children?: SidebarItem[]
}

const sidebarItems: SidebarItem[] = [
  {
    label: '내 정보 수정',
    path: '/mypage/myinfo',
    children: [
      { label: '기본정보', path: '/mypage/myinfo/detail' },
      { label: '비밀번호 변경', path: '/mypage/myinfo/changepassword' },
      { label: '연결된 계정', path: '/mypage/myinfo/linkedaccount' },
      { label: '배송지 관리', path: '/mypage/myinfo/address' },
      { label: '회원 탈퇴', path: '/mypage/myinfo/withdraw' },
    ],
  },
  {
    label: '내 티켓',
    path: '/mypage/ticket',
    children: [
      { label: '예매 / 취소 내역', path: '/mypage/ticket/history' },
      { label: '양도', path: '/mypage/ticket/transfer' },
      { label: '입장 인원 수 조회', path: '/mypage/ticket/entrancecheck' },
    ],
  },
  { label: '북마크', path: '/mypage/bookmark' },
]

const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const isActive = (path: string) => pathname === path
  const isParentActive = (parentPath: string) => pathname === parentPath

  return (
    <aside className={styles.sidebar}>
      {sidebarItems.map((item) => (
        <div key={item.label} className={styles.section}>
          <div
            className={`${styles.parent} ${isParentActive(item.path) ? styles.active : ''}`}
            onClick={() => navigate(item.path)}
            tabIndex={0}
            role="link"
            aria-current={isParentActive(item.path) ? 'page' : undefined}
            onKeyDown={(e) => e.key === 'Enter' && navigate(item.path)}
          >
            {item.label}
          </div>

          {item.children?.map((child) => (
            <div
              key={child.label}
              className={`${styles.child} ${isActive(child.path) ? styles.active : ''}`}
              onClick={() => navigate(child.path)}
              tabIndex={0}
              role="link"
              aria-current={isActive(child.path) ? 'page' : undefined}
              onKeyDown={(e) => e.key === 'Enter' && navigate(child.path)}
            >
              {child.label}
            </div>
          ))}
        </div>
      ))}
    </aside>
  )
}

export default Sidebar
