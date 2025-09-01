// src/components/transfer/TransferTicketInfo.tsx
import React from 'react';
import styles from './TransferTicketInfo.module.css';
import { useTicketDetailQuery } from '@/models/my/ticket/tanstack-query/useTickets';
import type { TicketDetailResponseDTO } from '@/models/my/ticket/ticketTypes';

type Props = {
  /** 상세 조회용 예약번호 */
  reservationNumber: string;
  className?: string;
};

const toYMDHM = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso || '-';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${day} ${hh}:${mm}`;
};

const deliveryLabel = (method?: TicketDetailResponseDTO['deliveryMethod']) =>
  method === 'MOBILE' ? '모바일 QR' : method === 'PAPER' ? '지류' : '-';

const TransferTicketInfo: React.FC<Props> = ({ reservationNumber, className }) => {
  const { data, isLoading, isError, error } = useTicketDetailQuery(reservationNumber);

  if (!reservationNumber) {
    return <div className={styles.card}>예약번호가 없어요.</div>;
  }

  if (isLoading) {
    return (
      <div className={styles.card} aria-busy="true">
        상세 정보를 불러오는 중…
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.card} role="alert" style={{ color: '#b91c1c' }}>
        티켓 상세 조회 실패: {(error as any)?.message ?? '알 수 없는 오류'}
      </div>
    );
  }

  const detail = data!;
  const poster = detail.posterFile || '';
  const festivalName = detail.fname || '-';
  const dateTime = detail.performanceDate ? toYMDHM(detail.performanceDate) : '-';
  const venue = detail.fcltynm || '-';
  const delivery = deliveryLabel(detail.deliveryMethod);

  return (
    <div className={`${styles.card} ${className ?? ''}`} aria-labelledby="ticket-info-title">
      <h2 id="ticket-info-title" className={styles.title}>양도 · 티켓 정보</h2>

      <div className={styles.body}>
        <div className={styles.posterWrap}>
          {poster ? (
            <img src={poster} alt={festivalName} className={styles.poster} />
          ) : (
            <div className={styles.posterEmpty} aria-label="포스터 없음">포스터</div>
          )}
        </div>

        <div className={styles.meta}>
          <strong className={styles.festival}>{festivalName}</strong>
          <div className={styles.row}>{dateTime}</div>
          <div className={styles.row}>{venue}</div>

          {/* 좌석/등급 정보가 상세에 없으므로 안전하게 생략 또는 기본값 */}
          {/* <div className={styles.row}>일반</div> */}

          {/* 가격 정보가 없으므로 배송(전달) 방식만 노출 */}
          <div className={styles.row}>{delivery}</div>
        </div>
      </div>
    </div>
  );
};

export default TransferTicketInfo;
