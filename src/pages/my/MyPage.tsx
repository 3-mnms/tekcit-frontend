// src/pages/my/MyPage.tsx
import React from 'react'
import Sidebar from '@/components/my/sidebar/Sidebar'
import Header from '@/components/common/header/Header'
import styles from './MyPage.module.css'
import { useOutlet, useNavigate, useLocation } from 'react-router-dom'

export type TabKey =
  | 'profileInfo'
  | 'passwordChange'
  | 'deliveryManagement'
  | 'accountWithdrawal'
  | 'bookingHistory'
  | 'ticketTransfer'
  | 'bookmark'

// 탭 <-> 경로 매핑
const TAB_TO_PATH: Record<TabKey, string> = {
  profileInfo: '/mypage/myinfo/detail',
  passwordChange: '/mypage/myinfo/changepassword',
  deliveryManagement: '/mypage/myinfo/address',
  accountWithdrawal: '/mypage/myinfo/withdraw',
  bookingHistory: '/mypage/ticket/history',
  ticketTransfer: '/mypage/ticket/transfer',
  bookmark: '/mypage/bookmark',
}

const PATH_TO_TAB: Array<[RegExp, TabKey]> = [
  [/^\/mypage\/?$/, 'profileInfo'],
  [/^\/mypage\/myinfo\/?$/, 'profileInfo'],
  [/^\/mypage\/myinfo\/detail\/?$/, 'profileInfo'],
  [/^\/mypage\/myinfo\/changepassword(?:\/.*)?$/, 'passwordChange'],
  [/^\/mypage\/myinfo\/address(?:\/.*)?$/, 'deliveryManagement'],
  [/^\/mypage\/myinfo\/withdraw(?:\/.*)?$/, 'accountWithdrawal'],
  [/^\/mypage\/ticket\/history(?:\/.*)?$/, 'bookingHistory'],
  [/^\/mypage\/ticket\/transfer(?:\/.*)?$/, 'ticketTransfer'],
  [/^\/mypage\/bookmark(?:\/.*)?$/, 'bookmark'],
];

const resolveTabFromPath = (path: string): TabKey => {
  for (const [re, tab] of PATH_TO_TAB) if (re.test(path)) return tab
  return 'profileInfo'
}

const MyPage: React.FC = () => {
  const outletEl = useOutlet()
  const navigate = useNavigate()
  const location = useLocation()

  // ✅ URL 기준으로 항상 activeTab 계산
  const activeTab = React.useMemo(() => resolveTabFromPath(location.pathname), [location.pathname])

  const handleTabChange = React.useCallback(
    (k: TabKey) => {
      const to = TAB_TO_PATH[k]
      if (to && to !== location.pathname) navigate(to)
    },
    [navigate, location.pathname],
  )

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.wrapper}>
        <aside className={styles.sidebarSlot}>
          <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
        </aside>
        {/* ✅ 라우트 아웃렛을 우선 사용 (중첩 라우팅) */}
        <main className={styles.content}>{outletEl}</main>
      </div>
    </div>
  )
}

export default MyPage
