import React from 'react'
import styles from './NotificationDropdown.module.css'
import NotificationItem from '@components/my/dropdown/NotificationItem'
import { useNotificationStore } from '@/models/dropdown/NotificationStore'
import { FaChevronLeft } from 'react-icons/fa6'

type Props = {
  onBack?: () => void
  onOpenDetail: (nid: number) => void
  contentOnly?: boolean
}

const NotificationDropdown: React.FC<Props> = ({ onBack, onOpenDetail, contentOnly }) => {
  const { notifications, markAllAsRead } = useNotificationStore()
  const unreadCount = notifications.filter(n => !n.read).length

  const Inner = (
    <>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="뒤로">
          <FaChevronLeft size={14} />
        </button>
        <h3 className={styles.title}>공지사항</h3>

        <div className={styles.headerRight}>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className={styles.markAllBtn}
              aria-label="전체 읽음"
              title="전체 읽음"
            >
              전체 읽음
            </button>
          )}
        </div>
      </div>

      <div className={styles.list}>
        {notifications.map((n) => (
          <NotificationItem
            key={`nid-${n.id}`}
            id={n.id}
            title={n.title}
            message={n.message}
            time={n.time}
            read={n.read}
            onOpen={() => onOpenDetail(n.id)}
          />
        ))}
      </div>
    </>
  )

  if (contentOnly) return Inner
  return <div className={styles.dropdown}>{Inner}</div>
}

export default NotificationDropdown
