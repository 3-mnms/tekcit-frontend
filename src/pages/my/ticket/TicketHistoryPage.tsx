import React from 'react';
import ReservationFilter from '@/components/my/ticket/ReservationFilter';
import ReservationTable from '@/components/my/ticket/ReservationTable';
import styles from './TicketHistoryPage.module.css';

const TicketHistoryPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>예매 / 취소 내역</h2>
      <ReservationFilter />
      <ReservationTable />
    </div>
  );
};

export default TicketHistoryPage;
