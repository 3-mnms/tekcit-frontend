// src/pages/.../TicketHistoryPage.tsx
import React, { useState } from 'react'
import { ReservationPeriod, ReservationDateRange } from '@/components/my/ticket/ReservationFilter'
import ReservationTable from '@/components/my/ticket/ReservationTable'
import styles from './TicketHistoryPage.module.css'

const STATUSES = ['전체', '예매 완료', '취소 완료'] as const

const TicketHistoryPage: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [filteredStartDate, setFilteredStartDate] = useState<Date | null>(null)
  const [filteredEndDate, setFilteredEndDate] = useState<Date | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('전체')

  const handleQuick = (months: number) => {
    const now = new Date()
    const from = new Date()
    from.setMonth(now.getMonth() - months)
    setStartDate(months === 0 ? null : from) // 전체일 때는 null 처리도 가능
    setEndDate(months === 0 ? null : now)
  }

  const handleSearch = () => {
    setFilteredStartDate(startDate)
    setFilteredEndDate(endDate)
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerWrap}>
        <h2 className={styles.title}>예매 / 취소 내역</h2>
      </div>

      <section className={styles.card}>
        <div className={styles.cardBody}>
          <div className={styles.filtersGrid}>
            {/* 왼쪽: 기간별 조회 */}
            <ReservationPeriod onQuick={handleQuick} />

            {/* 오른쪽: 예매상태 */}
            <div className={styles.block}>
              <label className={styles.blockLabel}>예매상태</label>
              <div className={styles.btnGroup}>
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`${styles.filterBtn} ${statusFilter === s ? styles.filterBtnActive : ''}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* ⬇️ 아래 줄 전체 폭: 주문일자별 조회 */}
            <ReservationDateRange
              startDate={startDate}
              endDate={endDate}
              onChangeStartDate={setStartDate}
              onChangeEndDate={setEndDate}
              onSearch={handleSearch}
            />
          </div>
        </div>
      </section>

      <ReservationTable startDate={filteredStartDate} endDate={filteredEndDate} statusFilter={statusFilter} />
    </div>
  )
}

export default TicketHistoryPage
