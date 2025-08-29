// src/pages/mypage/ticket/TicketDetailPage.tsx
import React from 'react'
import { useParams, Navigate } from 'react-router-dom'
import TicketInfoCard from '@/components/my/ticket/TicketInfoCard'
import PaymentInfoSection from '@/components/my/ticket/PaymentInfoSection'
import { useTicketDetailQuery } from '@/models/my/ticket/tanstack-query/useTickets'
import { useAuthStore } from '@/shared/storage/useAuthStore'
import styles from './TicketHistoryPage.module.css'

const TicketDetailPage: React.FC = () => {
  const { reservationNumber } = useParams<{ reservationNumber: string }>()

  const authReady = useAuthStore((s) => s.authReady)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const reserverName = useAuthStore((s) => s.user?.name ?? '')

  const { data, isLoading, isError, error } = useTicketDetailQuery(reservationNumber)

  if (!authReady) {
    return <div className="w-full p-8">초기화 중…</div>
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="w-full p-8">
      <h2 className={styles.title}>예매내역 확인 · 취소</h2>

      {isLoading && <div>불러오는 중…</div>}
      {isError && <div>불러오기 실패: {(error as Error)?.message ?? '알 수 없는 오류'}</div>}

      {data && (
        <>
          <TicketInfoCard
            festivalId={data.festivalId}
            reservationNumber={data.reservationNumber}
            title={data.fname}
            place={data.fcltynm}
            performanceDateISO={data.performanceDate}
            deliveryMethod={data.deliveryMethod}
            qrIds={data.qrId}
            address={data.address ?? undefined}
            posterFile={data.posterFile}
            reserverName={reserverName}
          />
          <PaymentInfoSection
            festivalId={data.festivalId} 
            reservationNumber={data.reservationNumber} 
          />
        </>
      )}
    </div>
  )
}

export default TicketDetailPage
