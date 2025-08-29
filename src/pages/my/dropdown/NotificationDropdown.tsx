// src/components/my/dropdown/NotificationDropdown.tsx
import React from 'react'
import styles from './NotificationDropdown.module.css'
import NotificationItem from '@components/my/dropdown/NotificationItem'
import { useNotificationStore } from '@/models/dropdown/NotificationStore'
import { useHydrateNotifications } from '@/models/dropdown/useNotificationQuery'
import { FaChevronLeft } from 'react-icons/fa6'

type Props = {
  onBack?: () => void;
  contentOnly?: boolean;
}

const NotificationDropdown: React.FC<Props> = ({ onBack, contentOnly }) => {
  const { notifications, markAllAsRead, markAsRead } = useNotificationStore()
  const { isLoading, isError } = useHydrateNotifications(true); 

  const Inner = (
    <>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="뒤로">
          <FaChevronLeft size={14} />
        </button>
        <h3 className={styles.title}>공지사항</h3>
      </div>

      {isLoading ? (
        <div className={styles.loading}>불러오는 중…</div>
      ) : isError ? (
        <div className={styles.error}>알림을 불러오지 못했어요 😿</div>
      ) : (
        <div className={styles.list}>
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              {...n}
              onRead={() => markAsRead(n.id)}
            />
          ))}
          {notifications.length === 0 && (
            <div className={styles.empty}>새 알림이 없어요!</div>
          )}
        </div>
      )}

      <div className={styles.footer}>
        <button onClick={markAllAsRead}>전체 읽음</button>
      </div>
    </>
  )

  if (contentOnly) return Inner
  return <div className={styles.dropdown}>{Inner}</div>
}

export default NotificationDropdown
