// src/pages/mypage/ticket/transfer/TransferTicketPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import styles from './TransferTicketPage.module.css';
import { useNavigate } from 'react-router-dom';
import { useTicketsQuery, useTicketDetailQuery } from '@/models/my/ticket/tanstack-query/useTickets';
import type { TicketListItem } from '@/models/my/ticket/ticketTypes';

export const TRANSFER_DONE_EVENT = 'ticket:transferred';

/** ✅ 포스터만 가져오는 얇은 컴포넌트 */
const TicketPoster: React.FC<{
  reservationNumber: string;
  alt: string;
  className?: string;
}> = ({ reservationNumber, alt, className }) => {
  const { data } = useTicketDetailQuery(reservationNumber);
  // 상세에 posterFile(string)이 들어옴
  const src = data?.posterFile || '/dummy-poster.jpg';
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = '/dummy-poster.jpg';
      }}
    />
  );
};

const TransferTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const { data } = useTicketsQuery();

  const [hidden, setHidden] = useState<Set<string>>(new Set());

  useEffect(() => {
    const onDone = (ev: Event) => {
      const num = (ev as CustomEvent<string>).detail;
      setHidden((prev) => {
        const next = new Set(prev);
        next.add(num);
        return next;
      });
    };
    window.addEventListener(TRANSFER_DONE_EVENT, onDone as EventListener);
    return () => window.removeEventListener(TRANSFER_DONE_EVENT, onDone as EventListener);
  }, []);

  const visibleTickets = useMemo(() => {
    const list = data ?? [];
    return list.filter(
      (t) => t.rawStatus === 'CONFIRMED' && !hidden.has(t.reservationNumber)
    );
  }, [data, hidden]);

  const handleTransfer = (row: TicketListItem) => {
    navigate('/mypage/ticket/transfer/test', {
      state: {
        reservationNumber: row.reservationNumber,
        ticket: row,
      },
    });
  };

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>티켓 양도</h2>

      <div className={styles.list}>
        {visibleTickets.map((t) => (
          <div key={t.reservationNumber} className={styles.card}>
            {/* ✅ 상세 API에서 posterFile을 불러와 썸네일로 사용 */}
            <TicketPoster
              reservationNumber={t.reservationNumber}
              alt={`${t.title} 포스터`}
              className={styles.poster}
            />

            <div className={styles.details}>
              <div className={styles.info}>
                <p>
                  <strong>예매일</strong>: {t.date}
                </p>
                <p>
                  <strong>예매번호</strong>: {t.number}
                </p>
                <p>
                  <strong>공연명</strong>: {t.title}
                </p>
                <p>
                  <strong>일시</strong>: {t.dateTime}
                </p>
                <p>
                  <strong>매수</strong>: {t.count}
                </p>
              </div>
              <div className={styles.buttonWrapper}>
                <button className={styles.transferBtn} onClick={() => handleTransfer(t)}>
                  양도하기
                </button>
              </div>
            </div>
          </div>
        ))}
        {visibleTickets.length === 0 && (
          <div className={styles.empty}>양도 가능한 티켓이 없어요.</div>
        )}
      </div>
    </div>
  );
};

export default TransferTicketPage;
