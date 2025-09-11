import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from './Sidebar.module.css'
import { useState } from 'react'
import SidebarElement from './element/SidebarElement'

interface SidebarItem {
  label: string
  path: string
  children?: SidebarItem[]
}

const sidebarItems = {
  profileInfo: {
    title: '기본정보',
    activeTab: 'profileInfo',
  },
  passwordChange: {
    title: '비밀번호 변경',
    activeTab: 'passwordChange',
  },
  deliveryManagement: {
    title: '배송지 관리',
    activeTab: 'deliveryManagement',
  },
  accountWithdrawal: {
    title: '회원 탈퇴',
    activeTab: 'accountWithdrawal',
  },
  bookingHistory: {
    title: '예매 / 취소 내역',
    activeTab: 'bookingHistory',
  },
  ticketTransfer: {
    title: '티켓 양도',
    activeTab: 'ticketTransfer',
  },
  bookmark: {
    title: '북마크',
    activeTab: 'bookmark',
  },
}
const Sidebar: React.FC = () => {
  const renderContent = () => {
    // switch (activeTab) {
    //   case 'profileInfo':
    //     return <ProfileInfo />
    //   case 'bookingHistory':
    //     return <BookingHistory />
    //   case 'bookmark':
    //     return <Bookmark />
    //   case 'passwordChange':
    //     return <PasswordChange />
    //   case 'deliveryManagement':
    //     return <DeliveryManagement />
    //   case 'accountWithdrawal':
    //     return <AccountWithdrawal />
    //   case 'ticketTransfer':
    //     return <TicketTransfer />
    //   default:
    //     return <BookingHistory />
    // }
  }

  const [activeTab, setActiveTab] = useState('booking-history')
  console.log(activeTab)

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
                    tabKey={sidebarItems.profileInfo.activeTab}
                    activeTab={activeTab}
                    onClick={() => setActiveTab(sidebarItems.profileInfo.activeTab)}
                  />

                  <SidebarElement
                    title={sidebarItems.passwordChange.title}
                    tabKey={sidebarItems.passwordChange.activeTab}
                    activeTab={activeTab}
                    onClick={() => setActiveTab(sidebarItems.passwordChange.activeTab)}
                  />
                  <SidebarElement
                    title={sidebarItems.deliveryManagement.title}
                    tabKey={sidebarItems.deliveryManagement.activeTab}
                    activeTab={activeTab}
                    onClick={() => setActiveTab(sidebarItems.deliveryManagement.activeTab)}
                  />
                  <SidebarElement
                    title={sidebarItems.accountWithdrawal.title}
                    tabKey={sidebarItems.accountWithdrawal.activeTab}
                    activeTab={activeTab}
                    onClick={() => setActiveTab(sidebarItems.accountWithdrawal.activeTab)}
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
                    tabKey={sidebarItems.bookingHistory.activeTab}
                    activeTab={activeTab}
                    onClick={() => setActiveTab(sidebarItems.bookingHistory.activeTab)}
                  />
                  <SidebarElement
                    title={sidebarItems.ticketTransfer.title}
                    tabKey={sidebarItems.ticketTransfer.activeTab}
                    activeTab={activeTab}
                    onClick={() => setActiveTab(sidebarItems.ticketTransfer.activeTab)}
                  />
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  <SidebarElement
                    title={sidebarItems.bookmark.title}
                    tabKey={sidebarItems.bookmark.activeTab}
                    activeTab={activeTab}
                    onClick={() => setActiveTab(sidebarItems.bookmark.activeTab)}
                  />
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">{renderContent()}</div>
      </div>
    </div>
  )
}

export default Sidebar
