import React from 'react';
import styles from './NotificationItem.module.css';
import { FaCheck } from 'react-icons/fa6';

interface Props {
  title: string;
  message: string;
  time: string;
  read: boolean;
  onRead: () => void;
}

const NotificationItem: React.FC<Props> = ({
  title,
  message,
  time,
  read,
  onRead,
}) => {
  return (
    <div className={`${styles.item} ${read ? styles.read : ''}`}>
      <div className={styles.topRow}>
        <p className={styles.title}>{title}</p>
        {!read && (
          <button onClick={onRead} className={styles.checkBtn}>
             <FaCheck size={16} color="#7c7c7cff" />
          </button>
        )}
      </div>
      <p className={styles.message}>{message}</p>
      <div className={styles.bottomRight}>
        <span className={styles.time}>{time}</span>
      </div>
    </div>
  );
};

export default NotificationItem;
