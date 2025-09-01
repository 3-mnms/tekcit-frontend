// src/pages/mypage/ticket/transfer/TransferTicketPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import styles from './TransferTicketPage.module.css';
import { useNavigate } from 'react-router-dom';
import { useTicketsQuery } from '@/models/my/ticket/tanstack-query/useTickets';
import type { TicketListItem } from '@/models/my/ticket/ticketTypes';

import BeforeTransferTicket from '@/components/my/ticket/BeforeTransferTicket';
import AfterTransferTicket from '@/components/my/ticket/AfterTransferTicket';

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

  // ✅ 양도할 수 있는 내 티켓
  const visibleTickets = useMemo(() => {
    const list = data ?? [];
    return list.filter((t) => t.rawStatus === 'CONFIRMED' && !hidden.has(t.reservationNumber));
  }, [data, hidden]);

  // ✅ 양도받을 티켓 (예시 데이터 — 추후 API 연결)
  const receivedTicket = {
    title: '그랜드 민트 페스티벌 2025',
    date: '2025-10-18',
    time: '17:00',
    relation: '지인' as const,
    status: 'PENDING' as const,
  };

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

      {/* ✅ 양도받을 티켓이 있을 때만 보여줌 */}
      {receivedTicket && (
        <div className={styles.receivedSection}>
          <AfterTransferTicket
            title={receivedTicket.title}
            date={receivedTicket.date}
            time={receivedTicket.time}
            relation={receivedTicket.relation}
            status={receivedTicket.status}
            onAccept={() => alert('수락')}
            onReject={() => alert('거절')}
          />
        </div>
      )}

      <div className={styles.list}>
        {visibleTickets.map((t) => (
          <BeforeTransferTicket
            key={t.reservationNumber}
            item={t}
            onTransfer={handleTransfer}
          />
        ))}

        {visibleTickets.length === 0 && (
          <div className={styles.empty}>양도 가능한 티켓이 없어요.</div>
        )}
      </div>
    </div>
  );
};

export default TransferTicketPage;
