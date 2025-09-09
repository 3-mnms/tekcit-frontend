import React from 'react';
import styles from './LoadingTikky.module.css';
import tikky from '@/shared/assets/tiki2.png';

type Props = {
  size?: number;         // 전체 크기(px)
  text?: string;         // 보조 문구
  className?: string;
};

const LoadingTikky: React.FC<Props> = ({ size = 140, text = '로딩 중…', className }) => {
  return (
    <div
      className={`${styles.wrap} ${className ?? ''}`}
      style={{ width: size, height: size }}
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      {/* 캐릭터 */}
      <img className={styles.tikky} src={tikky} alt="" draggable={false} />

      {/* 점점점 */}
      <div className={styles.dots}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>

      {/* 바닥 그림자 */}
      <div className={styles.shadow} aria-hidden="true" />

      {/* 텍스트 */}
      {text && <div className={styles.label}>{text}</div>}
    </div>
  );
};

export default LoadingTikky;
