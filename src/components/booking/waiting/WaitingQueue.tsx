import React from 'react';
import styles from './WaitingQueue.module.css';

type Props = {
  title: string;
  dateTime: string;
  waitingCount: number;     // 내 앞에 몇 명
  progressPct: number;      // 0~100
  posterUrl?: string;       // 없으면 회색 박스
  fullBleed?: boolean;      // 🔥 웨이팅 페이지에서만 전체 화면 느낌
};

const WaitingQueue: React.FC<Props> = ({
  title,
  dateTime,
  waitingCount,
  progressPct,
  posterUrl,
  fullBleed = false,
}) => {
  return (
    <div className={fullBleed ? styles.cardFull : styles.card}>
      {/* 포스터 */}
      <div
        className={styles.poster}
        style={posterUrl ? { backgroundImage: `url(${posterUrl})` } : undefined}
      />

      {/* 정보 */}
      <div className={styles.info}>
        <p className={styles.title}>{title}</p>
        <p className={styles.date}>{dateTime}</p>
        <p className={styles.waiting}>내 앞에 {waitingCount}명</p>
      </div>

      {/* 진행 바 */}
      <div className={styles.progressBar}>
        <div
          className={styles.progress}
          style={{ width: `${Math.max(0, Math.min(100, progressPct))}%` }}
        />
      </div>
    </div>
  );
};

export default WaitingQueue;
