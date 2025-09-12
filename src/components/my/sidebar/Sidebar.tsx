// src/components/my/sidebar/Sidebar.tsx
import React from 'react'
// import styles from './Sidebar.module.css';
import SidebarElement from './element/SidebarElement'
import type { TabKey } from '@/pages/my/MyPage'

const sidebarItems = {
  profileInfo: { title: '기본정보', key: 'profileInfo' as TabKey },
  passwordChange: { title: '비밀번호 변경', key: 'passwordChange' as TabKey },
  deliveryManagement: { title: '배송지 관리', key: 'deliveryManagement' as TabKey },
  accountWithdrawal: { title: '회원 탈퇴', key: 'accountWithdrawal' as TabKey },
  bookingHistory: { title: '예매 / 취소 내역', key: 'bookingHistory' as TabKey },
  ticketTransfer: { title: '티켓 양도', key: 'ticketTransfer' as TabKey },
  bookmark: { title: '관심목록', key: 'bookmark' as TabKey },
}

type Props = {
  activeTab: TabKey
  setActiveTab: (k: TabKey) => void
}

const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen  fixed border-red-100 ">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  내 정보 수정
                </h2>
                <div className="space-y-3">
                  <SidebarElement
                    title={sidebarItems.profileInfo.title}
                    tabKey={sidebarItems.profileInfo.key}
                    activeTab={activeTab}
                    onClick={() => setActiveTab(sidebarItems.profileInfo.key)}
                  />

                  <SidebarElement
                    title={sidebarItems.passwordChange.title}
                    tabKey={sidebarItems.passwordChange.key}
                    activeTab={activeTab}
                    onClick={() => setActiveTab(sidebarItems.passwordChange.key)}
                  />
                  <SidebarElement
                    title={sidebarItems.deliveryManagement.title}
                    tabKey={sidebarItems.deliveryManagement.key}
                    activeTab={activeTab}
                    onClick={() => setActiveTab(sidebarItems.deliveryManagement.key)}
                  />
                  <SidebarElement
                    title={sidebarItems.accountWithdrawal.title}
                    tabKey={sidebarItems.accountWithdrawal.key}
                    activeTab={activeTab}
                    onClick={() => setActiveTab(sidebarItems.accountWithdrawal.key)}
                  />
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  내 티켓
                </h2>
                <div className="space-y-3">
                  <SidebarElement
                    title={sidebarItems.bookingHistory.title}
                    tabKey={sidebarItems.bookingHistory.key}
                    activeTab={activeTab}
                    onClick={() => setActiveTab(sidebarItems.bookingHistory.key)}
                  />
                  <SidebarElement
                    title={sidebarItems.ticketTransfer.title}
                    tabKey={sidebarItems.ticketTransfer.key}
                    activeTab={activeTab}
                    onClick={() => setActiveTab(sidebarItems.ticketTransfer.key)}
                  />
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  북마크
                </h2>{' '}
                <div className="space-y-3">
                  <SidebarElement
                    title={sidebarItems.bookmark.title}
                    tabKey={sidebarItems.bookmark.key}
                    activeTab={activeTab}
                    onClick={() => setActiveTab(sidebarItems.bookmark.key)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {/* <div className="flex-1 p-8">{renderContent()}</div> */}
      </div>
    </div>
  )
}

export default Sidebar
