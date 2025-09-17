// src/pages/mypage/ticket/TicketDetailPage.tsx
import React, { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import TicketInfoCard from '@/components/my/ticket/TicketInfoCard'
import PaymentInfoSection from '@/components/my/ticket/PaymentInfoSection'
import { useTicketDetailQuery } from '@/models/my/ticket/tanstack-query/useTickets'
import { useAuthStore } from '@/shared/storage/useAuthStore'
import styles from './TicketHistoryPage.module.css'
import Spinner from '@/components/common/spinner/Spinner'

const TicketDetailPage: React.FC = () => {

  const { reservationNumber } = useParams<{ reservationNumber: string }>()
  const authReady = useAuthStore((s) => s.authReady)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const reserverName = useAuthStore((s) => s.user?.name ?? '')

  const { data, isLoading, isError, error } = useTicketDetailQuery(reservationNumber)

  useEffect(() => {
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''
    document.body.classList.remove('noScroll', 'modal-open', 'lockScroll')
  }, [])
  
  if (!authReady) {
    return <div className="w-full p-8">초기화 중…</div>
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className={styles.container}>
      <div>
        <h2 className={styles.title}>예매 내역 확인 · 취소</h2>

        {isLoading && <Spinner />}
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
              bookingId={data.reservationNumber}
              reservationNumber={data.reservationNumber}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default TicketDetailPage
