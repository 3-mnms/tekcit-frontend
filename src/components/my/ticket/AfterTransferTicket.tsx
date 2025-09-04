import React from 'react';
import styles from './AfterTransferTicket.module.css';

import Button from '@/components/common/button/Button';

const priceFormatter = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  maximumFractionDigits: 0,
});

type Relation = '가족' | '지인';
type RawStatus = string | number;
type NormalizedStatus = 'REQUEST' | 'APPROVED' | 'REJECTED';

/**
 * 서버 상태 → 화면 상태 정규화
 * - REQUEST(요청 그룹): REQUESTED, APPROVED(서버상 승인 대기/진행), WAITING, PENDING, '0', '1'
 * - APPROVED(양도 승인 완료): COMPLETED, SUCCESS, OK, '2'
 * - REJECTED(양도 거부/취소): CANCELED/CANCELLED, REJECTED, DENIED, DECLINED, '3'
 */
function normalizeStatus(s?: RawStatus): NormalizedStatus {
  if (typeof s === 'number') {
    if (s === 0 || s === 1) return 'REQUEST'; // REQUESTED/APPROVED(요청으로 묶음)
    if (s === 2) return 'APPROVED';           // COMPLETED
    if (s === 3) return 'REJECTED';           // CANCELED
    return 'REQUEST';
  }

  const v = (s ?? '').toString().trim().toUpperCase();
  if (['0', '1', 'REQUESTED', 'APPROVED', 'WAITING', 'PENDING'].includes(v)) return 'REQUEST';
  if (['2', 'COMPLETED', 'SUCCESS', 'OK'].includes(v)) return 'APPROVED';
  if (['3', 'REJECTED', 'DENIED', 'DECLINED', 'CANCELED', 'CANCELLED'].includes(v)) return 'REJECTED';
  return 'REQUEST';
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
    if (s === 'REQUEST') return <span className={`${styles.badge} ${styles.request}`}>양도 요청</span>;
    if (s === 'APPROVED') return <span className={`${styles.badge} ${styles.approved}`}>양도 승인</span>;
    if (s === 'REJECTED') return <span className={`${styles.badge} ${styles.rejected}`}>양도 거부</span>;
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

        {s === 'REQUEST' && (
          <div className={styles.buttonWrapper}>
            <Button
              type="button"
              className={`${styles.btn} ${styles.accept}`}
              onClick={onAccept}
              aria-label="양도 수락"
            >
              수락
            </Button>
            <Button
              type="button"
              className={`${styles.btn} ${styles.reject}`}
              onClick={onReject}
              aria-label="양도 거절"
            >
              거절
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AfterTransferTicket;
