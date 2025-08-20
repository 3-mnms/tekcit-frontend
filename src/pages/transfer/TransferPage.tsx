import React from 'react';
import styles from './TransferPage.module.css';
import TransferTicketInfo from '@/components/transfer/TransferTicketInfo';
import TransferRefundGuide from '@/components/transfer/TransferRefundGuide';
import TransferRecipientForm from '@/components/transfer/TransferRecipientForm';

const mockTicket = {
  festivalName: '그랜드 민트 페스티벌 2025',
  date: '2025-10-18',
  time: '18:00',
  venue: '올림픽공원 88잔디마당',
  seat: 'A구역 12열 14번',
  grade: 'VIP',
  delivery: 'QR' as const,
  price: 165000,
  posterUrl: '',
};

const TransferPage: React.FC = () => {
  return (
    <div className={styles.wrap}>
      <div className={styles.page}>
        <section className={`${styles.col} ${styles.info}`}>
          <TransferTicketInfo ticket={mockTicket} />
        </section>

        <section className={`${styles.col} ${styles.guide}`}>
          <TransferRefundGuide />
        </section>

        <section className={`${styles.col} ${styles.form}`}>
          <TransferRecipientForm />
        </section>
      </div>
    </div>
  );
};

export default TransferPage;