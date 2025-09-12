// src/components/my/sidebar/element/SidebarElement.tsx
import React from 'react'
import type { TabKey } from '@/pages/my/MyPage'

const SidebarElement = ({
  activeTab,
  tabKey,
  title,
  onClick,
}: {
  activeTab: TabKey
  tabKey: TabKey
  title: string
  onClick: () => void
}) => {
  return (
    <div
      className={`cursor-pointer transition-colors px-3 py-2 rounded-lg ${
        tabKey === activeTab
          ? 'text-blue-600 font-medium bg-blue-50'
          : 'text-gray-600 hover:text-blue-600'
      }`}
      onClick={onClick}
    >
      {title}
    </div>
  )
}

export default SidebarElement
