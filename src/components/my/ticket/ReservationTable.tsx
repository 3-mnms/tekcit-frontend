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

  const goDetail = (row: TicketListItem) =>
    navigate(`/mypage/ticket/detail/${row.reservationNumber}`)

  if (isLoading) {
    return (
      <div className={styles.skeletonList}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={styles.skelCard} />
        ))}
      </div>
    )
  }

  if (isError) {
    return <div className={styles.errorBox}>예매 내역이 없습니다.</div>
  }

  if (!filteredData.length) {
    return (
      <div className={`${styles.card} ${styles.empty}`}>
        <div className={styles.emptyIcon} aria-hidden />
        <h3 className={styles.emptyTitle}>예매 내역이 없습니다</h3>
        <p className={styles.emptyDesc}>선택한 조건에 해당하는 예매 내역이 없습니다.</p>
        <button className={styles.primaryBtn}>티켓 예매하기</button>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {filteredData.map((item) => (
        <article key={item.reservationNumber} className={styles.card}>
          <div className={styles.leftBar} aria-hidden />
          <div className={styles.cardBody}>
            <div className={styles.topRow}>
              <div className={styles.titleWrap}>
                <h3 className={styles.title}>{item.title}</h3>
                <div className={styles.metaRow}>
                  <span className={styles.meta}><i className={styles.iTicket} />{item.number}</span>
                  <span className={styles.meta}><i className={styles.iCal} />{item.date}</span>
                  <span className={styles.meta}><i className={styles.iClock} />{item.dateTime?.split(' ')[1] ?? ''}</span>
                </div>
              </div>
              <span
                className={`${styles.badge} ${
                  item.statusLabel === '예매 완료'
                    ? styles.badgeBlue
                    : styles.badgeGray
                }`}
              >
                {item.statusLabel}
              </span>
            </div>

            <div className={styles.bottomRow}>
              <span className={styles.meta}><i className={styles.iUser} />{item.count}매</span>

              <div className={styles.actions}>
                <button className={styles.ghostBtn} onClick={() => goDetail(item)}>
                  상세보기
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

export default ReservationTable
