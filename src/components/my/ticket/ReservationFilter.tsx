// src/components/my/ticket/ReservationFilter.tsx
import React from 'react'
import styles from './ReservationFilter.module.css'

/* 기간별 버튼 */
export const ReservationPeriod: React.FC<{
  onQuick: (months: number) => void
}> = ({ onQuick }) => {
  const quick = (m: number) => {
    const now = new Date()
    const from = new Date()
    from.setMonth(now.getMonth() - m)
    onQuick(m) // 부모에서 날짜 set 두 개 처리
  }
  return (
    <div className={styles.block}>
      <label className={styles.label}>기간별 조회</label>
      <div className={styles.btnGroup}>
        <button className={styles.pillBtn} onClick={() => quick(0)}>전체</button>
        <button className={styles.pillBtn} onClick={() => quick(1)}>1개월</button>
        <button className={styles.pillBtn} onClick={() => quick(3)}>3개월</button>
        <button className={styles.pillBtn} onClick={() => quick(6)}>6개월</button>
      </div>
    </div>
  )
}

/* 주문일자 범위 + 조회 버튼 (전체 너비로 쓰게 설계) */
export const ReservationDateRange: React.FC<{
  startDate: Date | null
  endDate: Date | null
  onChangeStartDate: (d: Date | null) => void
  onChangeEndDate: (d: Date | null) => void
  onSearch: () => void
}> = ({ startDate, endDate, onChangeStartDate, onChangeEndDate, onSearch }) => {
  return (
    <div className={`${styles.rowFull} ${styles.block}`}>
      <label className={styles.label}>주문일자별 조회</label>
      <div className={styles.inlineRow}>
        <div className={styles.rangeRow}>
          <input
            className={styles.dateInput}
            type="date"
            value={startDate ? startDate.toISOString().slice(0, 10) : ''}
            onChange={(e) => onChangeStartDate(e.target.value ? new Date(e.target.value) : null)}
          />
          <span className={styles.tilde}>~</span>
          <input
            className={styles.dateInput}
            type="date"
            value={endDate ? endDate.toISOString().slice(0, 10) : ''}
            onChange={(e) => onChangeEndDate(e.target.value ? new Date(e.target.value) : null)}
          />
        </div>
        <button className={styles.searchBtn} onClick={onSearch}>조회</button>
      </div>
    </div>
  )
}
