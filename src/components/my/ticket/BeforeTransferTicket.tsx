// src/components/my/ticket/transfer/BeforeTransferTicket.tsx
import React from 'react';
import styles from './BeforeTransferTicket.module.css';
import type { TicketListItem } from '@/models/my/ticket/ticketTypes';

type Props = {
  item: TicketListItem;
  onTransfer: (reservationNumber: string) => void; // ⬅️ 변경: string만 넘김
};

const BeforeTransferTicket: React.FC<Props> = ({ item, onTransfer }) => {
  const fallbackPoster = '/dummy-poster.jpg';
  const posterSrc = item.posterFile ? encodeURI(item.posterFile) : '';

  return (
    <div className={styles.card}>
      <img
        src={posterSrc}
        alt={item.posterFile}
        className={styles.poster}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = fallbackPoster;
        }}
      />
      <div className={styles.details}>
        <div className={styles.info}>
          <p><strong>예매일</strong>: {item.date}</p>
          <p><strong>예매번호</strong>: {item.number}</p>
          <p><strong>공연명</strong>: {item.title}</p>
          <p><strong>일시</strong>: {item.dateTime}</p>
          <p><strong>매수</strong>: {item.count}</p>
        </div>
        <div className={styles.buttonWrapper}>
          <button
            className={styles.transferBtn}
            onClick={() => onTransfer(item.reservationNumber)} // ⬅️ 예매번호만 전달!
            aria-label="티켓 양도하기"
          >
            양도하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default BeforeTransferTicket;
