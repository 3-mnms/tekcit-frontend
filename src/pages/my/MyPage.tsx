// src/pages/my/MyPage.tsx
import React from 'react'
import Sidebar from '@/components/my/sidebar/Sidebar'
import Header from '@/components/common/header/Header'
import styles from './MyPage.module.css'
import { Outlet } from 'react-router-dom'
import { useOutlet, useNavigate, useLocation } from 'react-router-dom'

// 실제 페이지 컴포넌트들 import
import ProfileInfoPage from '@/pages/my/myInfo/basicinfo/DetailPage'
import ChangePasswordPage from '@/pages/my/myInfo/changepassword/ChangePasswordPage'
import AddressPage from '@/pages/my/myInfo/address/AddressListPage'
import WithdrawPage from '@/pages/my/myInfo/withdraw/WithdrawPage'
import TicketHistoryPage from '@/pages/my/ticket/TicketHistoryPage'
import TransferTicketPage from '@/pages/my/ticket/TransferTicketPage'
import BookmarkPage from '@/pages/my/myInfo/bookmark/BookmarkPage'

export type TabKey =
  | 'profileInfo'
  | 'passwordChange'
  | 'deliveryManagement'
  | 'accountWithdrawal'
  | 'bookingHistory'
  | 'ticketTransfer'
  | 'bookmark'

const contentMap: Record<TabKey, React.ReactNode> = {
  profileInfo: <ProfileInfoPage />,
  passwordChange: <ChangePasswordPage />,
  deliveryManagement: <AddressPage />,
  accountWithdrawal: <WithdrawPage />,
  bookingHistory: <TicketHistoryPage />,
  ticketTransfer: <TransferTicketPage />,
  bookmark: <BookmarkPage />,
}

const MyPage: React.FC = () => {
  // 기본 탭은 예매/취소 내역
  const [activeTab, setActiveTab] = React.useState<TabKey>('bookingHistory')

  const outletEl = useOutlet()
  const navigate = useNavigate()
  const location = useLocation()

  const handleTabChange = React.useCallback(
    (k: TabKey) => {
      setActiveTab(k)
      if (location.pathname !== '/mypage') {
        navigate('/mypage') // Outlet 비우고 탭 콘텐츠 노출
      }
    },
    [location.pathname, navigate],
  )

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.wrapper}>
        <aside className={styles.sidebarSlot}>
          <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
        </aside>
        <main className={styles.content}>{outletEl ?? contentMap[activeTab]}</main>
      </div>
    </div>
  )
}

export default MyPage
