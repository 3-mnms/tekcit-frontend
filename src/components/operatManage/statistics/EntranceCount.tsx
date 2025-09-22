import React from 'react';
import styles from './EntranceCount.module.css';
import { FaUserCheck } from 'react-icons/fa6';

interface Props {
  count: number;
  totalCount: number;
  title: string;
}

const EntranceCount: React.FC<Props> = ({ count, totalCount, title }) => {
  const percentage = Math.floor((count / totalCount) * 100);
  console.log(title);
  
  return (
    <div className={styles.highlightCard}>
      <h3 className={styles.header}>
        <FaUserCheck className={styles.icon} />
        입장 인원 수 조회
      </h3>
      <p className={styles.cardLabel}>
        {title} 공연 입장 인원
      </p>
      <p className={styles.cardCount}>
        {count}명 / {totalCount}명
      </p>
      <div className={styles.progressBar}>
        <div className={styles.progress} style={{ width: `${percentage}%` }} />
      </div>
      <p className={styles.percentLabel}>{percentage}%</p>
    </div>
  );
};

export default EntranceCount;