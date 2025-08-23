// src/components/booking/TicketInfoSection.tsx
import React from 'react';
import styles from './TicketInfoSection.module.css';

type TicketInfoSectionProps = {
  posterUrl?: string | null;
  title?: string | null;
  date?: string | null;       // YYYY-MM-DD
  time?: string | null;       // HH:mm
  unitPrice?: number | null;  // 1매 가격
  quantity?: number | null;   // 매수
  className?: string;
  compact?: boolean;          // 컴팩트 모드
};

const formatKRW = (n: number) => `${new Intl.NumberFormat('ko-KR').format(n)}원`;

const TicketInfoSection: React.FC<TicketInfoSectionProps> = ({
  posterUrl,
  title,
  date,
  time,
  unitPrice,
  quantity,
  className = '',
  compact = false,
}) => {
  // 안전 값
  const safeTitle = title ?? '';
  const safeDate = date ?? '';
  const safeTime = time ?? '';
  const price = typeof unitPrice === 'number' ? unitPrice : 0;
  const qty = typeof quantity === 'number' ? quantity : 0;
  const subtotal = price * qty;

  // 포스터 폴백
  const fallbackSvg =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300">
        <rect width="200" height="300" fill="#e5e7eb"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
              font-size="14" fill="#6b7280">No Poster</text>
      </svg>`
    );

  const titleClass = compact ? styles.titleCompact : styles.title;
  const posterClass = [
    styles.poster,
    compact ? styles.posterCompact : styles.posterWide,
  ].join(' ');

  const titleTextClass = compact ? styles.titleTextCompact : styles.titleText;
  const metaClass = compact ? styles.metaCompact : styles.meta;

  return (
    <section className={`${styles.container} ${className}`}>
      <h2 className={titleClass}>내 티켓 정보</h2>

      <div className={styles.row}>
        {/* 포스터 */}
        <div className={posterClass}>
          <img
            src={posterUrl || fallbackSvg}
            alt={safeTitle ? `${safeTitle} 포스터` : '포스터 이미지'}
            className={styles.posterImg}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = fallbackSvg;
            }}
            loading="lazy"
          />
        </div>

        {/* 정보 */}
        <div className={styles.info}>
          <div className={styles.stack}>
            <div className={titleTextClass} title={safeTitle}>{safeTitle}</div>
            <div
              className={metaClass}
              title={[safeDate, safeTime].filter(Boolean).join(' · ')}
            >
              {safeDate}
              {safeDate && safeTime ? ' · ' : ''}
              {safeTime}
            </div>
            {/* ✅ venue(장소) 완전 제거 */}
          </div>

          <div className={styles.priceBox}>
            <div className={styles.rowBetween}>
              <span className={styles.muted}>가격 × 수량</span>
              <span className={styles.titleText}>
                {formatKRW(price)} × {qty}매
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TicketInfoSection;
