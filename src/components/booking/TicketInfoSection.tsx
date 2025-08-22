import React from 'react';
import styles from './TicketInfoSection.module.css';

type TicketInfoSectionProps = {
  posterUrl?: string;
  title?: string;
  date?: string;
  time?: string;
  venue?: string;
  unitPrice?: number;
  quantity?: number;
  className?: string;
  compact?: boolean;   // ✅ 컴팩트 모드
};

const formatKRW = (n: number) => `${new Intl.NumberFormat('ko-KR').format(n)}원`;

const DUMMY = {
  posterUrl: 'https://picsum.photos/600/900?random=42',
  title: '그랜드 민트 페스티벌 2025',
  date: '2025-10-18(토)',
  time: '18:00',
  venue: '올림픽공원 88잔디마당',
  unitPrice: 120000,
  quantity: 2,
};

const TicketInfoSection: React.FC<TicketInfoSectionProps> = ({
  posterUrl = DUMMY.posterUrl,
  title = DUMMY.title,
  date = DUMMY.date,
  time = DUMMY.time,
  venue = DUMMY.venue,
  unitPrice = DUMMY.unitPrice,
  quantity = DUMMY.quantity,
  className = '',
  compact = false,
}) => {
  const subtotal = unitPrice * quantity;

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
            alt={`${title} 포스터`}
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
            <div className={titleTextClass} title={title}>{title}</div>
            <div className={metaClass} title={`${date} · ${time}`}>
              {date} · {time}
            </div>
            <div className={metaClass} title={venue}>{venue}</div>
          </div>

          <div className={styles.priceBox}>
            <div className={styles.rowBetween}>
              <span className={styles.muted}>가격 × 수량</span>
              <span className={styles.titleText}>
                {formatKRW(unitPrice)} × {quantity}매
              </span>
            </div>
            <div className={styles.rowBetween}>
              <span className={styles.muted}>소계</span>
              <span className={styles.subtotal}>{formatKRW(subtotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TicketInfoSection;
