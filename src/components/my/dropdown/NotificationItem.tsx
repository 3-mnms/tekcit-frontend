import React from 'react'
import styles from './NotificationItem.module.css'
import { FaCheck } from 'react-icons/fa6'
import { FaClock } from 'react-icons/fa'

interface Props {
  id: number
  title: string
  message: string
  time: string
  read: boolean
  onOpen: () => void
}

const NotificationItem: React.FC<Props> = ({ title, message, time, read, onOpen }) => {
  return (
    <div
      className={`${styles.item} ${read ? styles.read : styles.unread}`}
      onClick={onOpen}
      role="button"
      tabIndex={0}
    >
      <div className={styles.content}>
        <div className={styles.topRow}>
          <p className={styles.title}>{title}</p>
          {read ? (
            <FaCheck className={styles.checkIcon} />
          ) : (
            <span className={styles.unreadDot} />
          )}
        </div>


        <div className={styles.bottomRight}>
          <p className={styles.message}>{message}</p>
          <FaClock className={styles.clockIcon} />
          <span className={styles.time}>{time}</span>
        </div>
      </div>
    </div>
  )
}

export default NotificationItem
