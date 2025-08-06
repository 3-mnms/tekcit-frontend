import React from 'react';
import styles from './ReservationFilter.module.css';

interface Props {
  startDate: Date | null;
  endDate: Date | null;
  onChangeStartDate: (date: Date | null) => void;
  onChangeEndDate: (date: Date | null) => void;
  onSearch: () => void;
}

const ReservationFilter: React.FC<Props> = ({
  startDate,
  endDate,
  onChangeStartDate,
  onChangeEndDate,
  onSearch,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.filterRow}>
        <span className={styles.label}>기간별 조회</span>
        <div className={styles.periodButtons}>
          <button onClick={() => {
            const now = new Date();
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(now.getMonth() - 1);
            onChangeStartDate(oneMonthAgo);
            onChangeEndDate(now);
          }}>
            1개월
          </button>
          <button onClick={() => {
            const now = new Date();
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(now.getMonth() - 3);
            onChangeStartDate(threeMonthsAgo);
            onChangeEndDate(now);
          }}>
            3개월
          </button>
          <button onClick={() => {
            const now = new Date();
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(now.getMonth() - 6);
            onChangeStartDate(sixMonthsAgo);
            onChangeEndDate(now);
          }}>
            6개월
          </button>
        </div>
      </div>

      <div className={styles.filterRow}>
        <span className={styles.label}>주문일자별 조회</span>
        <input
          type="date"
          value={startDate ? startDate.toISOString().slice(0, 10) : ''}
          onChange={(e) => onChangeStartDate(e.target.value ? new Date(e.target.value) : null)}
        />
        <span>~</span>
        <input
          type="date"
          value={endDate ? endDate.toISOString().slice(0, 10) : ''}
          onChange={(e) => onChangeEndDate(e.target.value ? new Date(e.target.value) : null)}
        />
        <button className={styles.searchBtn} onClick={onSearch}>조회</button>
      </div>
    </div>
  );
};

export default ReservationFilter;