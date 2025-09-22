import React from 'react';
import styles from './WaitingQueue.module.css';

type Props = {
  title: string;
  dateTime: string;
  waitingCount: number;
  progressPct: number;
  posterUrl?: string;
  fullBleed?: boolean;
};

const WaitingQueue: React.FC<Props> = ({
  title, dateTime, waitingCount, progressPct, posterUrl, fullBleed = false,
}) => {
  const fallback = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"/>'; // 투명
  const [src, setSrc] = React.useState(posterUrl || fallback);

  React.useEffect(() => {
    setSrc(posterUrl || fallback);
  }, [posterUrl]);

  return (
    <div className={fullBleed ? styles.cardFull : styles.card}>
      {/* 포스터 */}
      <div className={styles.poster}>
        {src && (
          <img
            className={styles.posterImg}
            src={src}
            alt=""
            onError={() => setSrc(fallback)}
          />
        )}
      </div>

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
