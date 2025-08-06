import React from 'react';
import styles from './ReservationFilter.module.css';

const ReservationFilter: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.filterRow}>
        <span className={styles.label}>기간별 조회</span>
        <div className={styles.periodButtons}>
          <button>1개월</button>
          <button>3개월</button>
          <button>6개월</button>
        </div>
      </div>

      <div className={styles.filterRow}>
        <span className={styles.label}>주문일자별 조회</span>
        <input type="date" />
        <span>~</span>
        <input type="date" />
        <button className={styles.searchBtn}>조회</button>
      </div>
    </div>
  );
};

export default ReservationFilter;
