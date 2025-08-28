import React, { useState } from 'react'
import ReservationFilter from '@/components/my/ticket/ReservationFilter'
import ReservationTable from '@/components/my/ticket/ReservationTable'
import styles from './TicketHistoryPage.module.css'

const TicketHistoryPage: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const [filteredStartDate, setFilteredStartDate] = useState<Date | null>(null)
  const [filteredEndDate, setFilteredEndDate] = useState<Date | null>(null)

  const [statusFilter, setStatusFilter] = useState<string>('전체') // 👈 상태 필터 추가

  const handleSearch = () => {
    setFilteredStartDate(startDate)
    setFilteredEndDate(endDate)
  }

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

      <div className={styles.statusFilterWrapper}>
        <div className={styles.selectBox}>
          <select
            id="statusFilter"
            className={styles.statusSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="" disabled>
              예매 상태
            </option>
            <option value="전체">전체</option>
            <option value="예매 완료">예매 완료</option>
            <option value="취소 완료">취소 완료</option>
          </select>
        </div>
      </div>
      
      <ReservationTable
        startDate={filteredStartDate}
        endDate={filteredEndDate}
        statusFilter={statusFilter}
      />
    </div>
  )
}

export default TicketHistoryPage
