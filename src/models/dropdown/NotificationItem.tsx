// src/components/my/dropdown/NotificationItem.tsx
import React from 'react';
import styles from './NotificationItem.module.css';

type Props = {
  id: number | string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  onRead?: () => void;
};

const NotificationItem: React.FC<Props> = ({ title, message, time, read, onRead }) => {
  return (
    <div className={`${styles.card} ${read ? styles.read : ''}`} onClick={onRead}>
      <div className={styles.title}>{title}</div>
      <div className={styles.body}>{message}</div>
      <div className={styles.time}>{time}</div>
      {!read && <span className={styles.badge} aria-hidden="true">✓</span>}
    </div>
  );
};
export default NotificationItem;
