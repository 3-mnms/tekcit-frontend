import React from 'react';
import styles from './TransferTicketInfo.module.css';

type Props = {
  ticket: {
    festivalName: string;
    date: string;
    time: string;
    venue: string;
    seat?: string | null;
    grade?: string | null;
    delivery: 'QR' | 'PAPER';
    price: number;
    posterUrl?: string;
  };
};

const TransferTicketInfo: React.FC<Props> = ({ ticket }) => {
  return (
    <div className={styles.card} aria-labelledby="ticket-info-title">
      <h2 id="ticket-info-title" className={styles.title}>양도 · 티켓 정보</h2>

      <div className={styles.body}>
        <div className={styles.posterWrap}>
          {ticket.posterUrl ? (
            <img src={ticket.posterUrl} alt={ticket.festivalName} className={styles.poster} />
          ) : (
            <div className={styles.posterEmpty}>포스터</div>
          )}
        </div>

        <div className={styles.meta}>
          <strong className={styles.festival}>{ticket.festivalName}</strong>
          <div className={styles.row}>{ticket.date} {ticket.time}</div>
          <div className={styles.row}>{ticket.venue}</div>
          <div className={styles.row}>
            {(ticket.grade ?? '일반')}{ticket.seat ? ` · ${ticket.seat}` : ''}
          </div>
          <div className={styles.price}>
            {ticket.price.toLocaleString()}원 · {ticket.delivery === 'QR' ? '모바일 QR' : '지류'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferTicketInfo;
