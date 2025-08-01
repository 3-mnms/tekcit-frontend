import React from 'react'
import styles from './NotificationDropdown.module.css'
import NotificationItem from '@components/my/dropdown/NotificationItem'
import { useNotificationStore } from '@/models/dropdown/NotificationStore'
import { FaChevronLeft } from 'react-icons/fa6'

const NotificationDropdown: React.FC = () => {
  const { notifications, markAllAsRead, markAsRead } = useNotificationStore()

  return (
    <div className={styles.dropdown}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => window.history.back()}>
          <FaChevronLeft size={14} />
        </button>
        <h3 className={styles.title}>공지사항</h3>
      </div>
      <div className={styles.list}>
        {notifications.map((n) => (
          <NotificationItem key={n.id} {...n} onRead={() => markAsRead(n.id)} />
        ))}
      </div>
      <div className={styles.footer}>
        <button onClick={markAllAsRead}>전체 읽음</button>
      </div>
    </div>
  )
}

export default NotificationDropdown
