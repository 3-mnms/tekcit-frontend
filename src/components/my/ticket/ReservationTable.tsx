// src/components/my/reservation/ReservationTable.tsx
import React, { useMemo } from 'react'
import styles from './ReservationTable.module.css'
import { useNavigate } from 'react-router-dom'
import { useTicketsQuery } from '@/models/my/ticket/tanstack-query/useTickets'
import type { TicketListItem } from '@/models/my/ticket/ticketTypes'

interface Props {
  startDate: Date | null
  endDate: Date | null
  statusFilter: string
}

const ReservationTable: React.FC<Props> = ({ startDate, endDate, statusFilter }) => {
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useTicketsQuery()

  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter((item) => {
      const reservationDate = new Date(item.date.replaceAll('.', '-'))
      if (startDate && reservationDate < startDate) return false
      if (endDate && reservationDate > endDate) return false
      if (statusFilter !== '전체' && item.statusLabel !== statusFilter) return false
      return true
    })
  }, [data, startDate, endDate, statusFilter])

  const handleRowClick = (row: TicketListItem) => {
    navigate(`/mypage/ticket/detail/${row.reservationNumber}`)
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table} aria-label="예매 내역">
        <thead>
          <tr>
            <th>예매일</th>
            <th>예매번호</th>
            <th>공연명</th>
            <th>일시</th>
            <th>매수</th>
            <th>예매상태</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={6}>불러오는 중…</td>
            </tr>
          )}
          {isError && (
            <tr>
              <td colSpan={6}>목록 조회 실패: {(error as Error)?.message ?? '알 수 없는 오류'}</td>
            </tr>
          )}
          {!isLoading && !isError && filteredData.length === 0 && (
            <tr>
              <td colSpan={6}>조건에 맞는 예매 내역이 없습니다.</td>
            </tr>
          )}
          {!isLoading &&
            !isError &&
            filteredData.map((item) => (
              <tr
                key={item.reservationNumber}
                onClick={() => handleRowClick(item)}
                className={styles.clickableRow}
              >
                <td data-label="예매일">{item.date}</td>
                <td data-label="예매번호" className={`${styles.mono} ${styles.ellipsis}`}>
                  {item.number}
                </td>
                <td data-label="공연명" className={`${styles.left} ${styles.ellipsis}`}>
                  {item.title}
                </td>
                <td data-label="일시">{item.dateTime}</td>
                <td data-label="매수">{item.count}</td>
                <td data-label="예매상태">{item.statusLabel}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

export default ReservationTable
