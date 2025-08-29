// src/components/my/dropdown/NotificationItem.tsx
import React from 'react'
import styles from './NotificationItem.module.css'

interface Props {
  id: number
  title: string
  message: string
  time: string
  read: boolean
  onOpen: () => void // ✅ 변경: 상세 열기
}

const NotificationItem: React.FC<Props> = ({ title, message, time, read, onOpen }) => {
  return (
    <div
      className={`${styles.item} ${read ? styles.read : ''}`}
      onClick={onOpen}
      role="button"
      tabIndex={0}
    >
      <div className={styles.topRow}>
        <p className={styles.title}>{title}</p>
      </div>
      <p className={styles.message}>{message}</p>
      <div className={styles.bottomRight}>
        <span className={styles.time}>{time}</span>
      </div>
    </div>
  )
}

export default NotificationItem
