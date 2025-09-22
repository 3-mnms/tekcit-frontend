// src/components/my/dropdown/NotificationDetailDropdown.tsx
import React, { useEffect } from 'react'
import styles from './NotificationDetailDropdown.module.css'
import { FaChevronLeft, FaClock } from 'react-icons/fa6'
import { useQuery } from '@tanstack/react-query'
import { fetchNotificationDetail } from '@/shared/api/my/notice'
import { useNotificationStore } from '@/models/dropdown/NotificationStore'
import { timeAgoKorean } from '@/models/dropdown/useNotificationQuery'

type Props = { nid: number; onBack?: () => void; contentOnly?: boolean }

const NotificationDetailDropdown: React.FC<Props> = ({ nid, onBack, contentOnly }) => {
  const markAsRead = useNotificationStore((s) => s.markAsRead)

  const isValid = Number.isFinite(nid)

  const q = useQuery({
    queryKey: ['notifications', 'detail', nid],
    queryFn: () => fetchNotificationDetail(nid),
    enabled: isValid,
  })

  useEffect(() => {
    if (q.data && !q.data.isRead && isValid) {
      markAsRead(nid)
    }
  }, [q.data, nid, isValid, markAsRead])

  if (!isValid) {
    if (contentOnly) return <div className={styles.error}>유효하지 않은 알림입니다.</div>
    return (
      <div className={styles.dropdown}>
        <div className={styles.error}>유효하지 않은 알림입니다.</div>
      </div>
    )
  }

  const Inner = (
    <>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="뒤로">
          <FaChevronLeft size={14} />
        </button>
        <h1 className={styles.title}>공지사항</h1>
      </div>

      {q.isLoading ? (
        <div className={styles.loading}>불러오는 중…</div>
      ) : q.isError || !q.data ? (
        <div className={styles.error}>상세를 불러오지 못했어요 😿</div>
      ) : (
        <div className={styles.detail}>
          <div className={styles.meta}>
            <span className={styles.fname}>{q.data.fname}</span>
            <FaClock className={styles.clockIcon} />
            <span className={styles.time}>{timeAgoKorean(q.data.sentAt)}</span>
          </div>
          <h4 className={styles.detailTitle}>{q.data.title}</h4>
          <p className={styles.body}>{q.data.body}</p>
        </div>
      )}
    </>
  )

  if (contentOnly) return Inner
  return <div className={styles.dropdown}>{Inner}</div>
}

export default NotificationDetailDropdown
