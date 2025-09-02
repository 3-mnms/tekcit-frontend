// src/components/my/ticket/transfer/AfterTransferTicket.tsx
import React from 'react';
import styles from './AfterTransferTicket.module.css';

const priceFormatter = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  maximumFractionDigits: 0,
});

type Relation = '가족' | '지인';
type RawStatus = string;
type NormalizedStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

function normalizeStatus(s?: RawStatus): NormalizedStatus {
  const v = (s ?? '').toString().trim().toUpperCase();
  if (['PENDING', 'WAITING', 'REQUESTED'].includes(v)) return 'PENDING';
  if (['APPROVED', 'ACCEPTED', 'SUCCESS', 'OK'].includes(v)) return 'APPROVED';
  if (['REJECTED', 'DENIED', 'DECLINED', 'CANCELED', 'CANCELLED'].includes(v)) return 'REJECTED';
  return 'PENDING';
}

type Props = {
  title: string;
  date: string;   // YYYY-MM-DD
  time: string;   // HH:mm
  relation: Relation;
  status: RawStatus;
  posterUrl?: string;
  price?: number; // 단가
  count: number;  // 매수
  onAccept?: () => void;
  onReject?: () => void;
  className?: string;
};

const AfterTransferTicket: React.FC<Props> = ({
  title,
  date,
  time,
  relation,
  status,
  posterUrl,
  price,
  count,
  onAccept,
  onReject,
  className = '',
}) => {
  const fallbackPoster = '/dummy-poster.jpg';
  const showPrice = relation === '지인' && Number.isFinite(price);

  const s = normalizeStatus(status);

  const StatusBadge = () => {
    if (s === 'PENDING') return <span className={`${styles.badge} ${styles.pending}`}>수락 대기중</span>;
    if (s === 'APPROVED') return <span className={`${styles.badge} ${styles.approved}`}>승인됨</span>;
    if (s === 'REJECTED') return <span className={`${styles.badge} ${styles.rejected}`}>거절됨</span>;
    return null;
  };

  // 총 금액 계산 (단가 * 매수)
  const totalPrice = showPrice ? (price as number) * count : null;

  return (
    <div className={`${styles.card} ${className}`}>
      <img
        src={posterUrl || fallbackPoster}
        alt={`${title} 포스터`}
        className={styles.poster}
        loading="lazy"
        decoding="async"
        onError={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          if (img.src !== window.location.origin + fallbackPoster && !img.src.endsWith(fallbackPoster)) {
            img.src = fallbackPoster;
          }
        }}
      />

      <div className={styles.details}>
        <div className={styles.topRow} aria-live="polite">
          <span className={styles.label}>공연명:</span>
          <span className={styles.value}>{title}</span>
          <StatusBadge />
        </div>

        <p><strong>일시:</strong> {date} {time}</p>
        <p><strong>매수:</strong> {count}매</p>
        <p><strong>관계:</strong> {relation}</p>

        {showPrice ? (
          <p className={styles.priceRow}>
            <strong>가격:</strong> {priceFormatter.format(totalPrice!)}{' '}
            <span className={styles.unitPrice}>
              ({priceFormatter.format(price!)} × {count})
            </span>
          </p>
        ) : (
          <p className={styles.priceRowHidden} aria-hidden="true" />
        )}


        {s === 'PENDING' && (
          <div className={styles.buttonWrapper}>
            <button
              type="button"
              className={`${styles.btn} ${styles.accept}`}
              onClick={onAccept}
              aria-label="양도 수락"
            >
              수락
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.reject}`}
              onClick={onReject}
              aria-label="양도 거절"
            >
              거절
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AfterTransferTicket;
