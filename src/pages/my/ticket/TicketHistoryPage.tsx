import React, { useState } from 'react';
import ReservationFilter from '@/components/my/ticket/ReservationFilter';
import ReservationTable from '@/components/my/ticket/ReservationTable';
import styles from './TicketHistoryPage.module.css';

const TicketHistoryPage: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | null>(null); 
  const [endDate, setEndDate] = useState<Date | null>(null); 

  const [filteredStartDate, setFilteredStartDate] = useState<Date | null>(null);
  const [filteredEndDate, setFilteredEndDate] = useState<Date | null>(null);

  const handleSearch = () => {
    setFilteredStartDate(startDate);
    setFilteredEndDate(endDate);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>예매 / 취소 내역</h2>
      <ReservationFilter
        startDate={startDate}
        endDate={endDate}
        onChangeStartDate={setStartDate}
        onChangeEndDate={setEndDate}
        onSearch={handleSearch}
      />
      <ReservationTable startDate={filteredStartDate} endDate={filteredEndDate} />
    </div>
  );
};

export default TicketHistoryPage;