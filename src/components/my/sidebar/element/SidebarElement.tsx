import React from 'react'

const SidebarElement = ({
  activeTab,
  tabKey,
  title,
  onClick,
}: {
  activeTab: string
  tabKey: string
  title: string
  onClick: () => void
}) => {
  console.log(tabKey)
  console.log(activeTab)

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
