// 💳 BookingPaymentHeader.tsx
import React from 'react'
import styles from '@pages/payment/BookingPaymentPage.module.css'

interface BookingPaymentHeaderProps {
  timeString: string        // 남은 시간 (MM:SS)
}

const BookingPaymentHeader: React.FC<BookingPaymentHeaderProps> = ({ timeString }) => {
  return (
    <header className={styles.topbar} aria-label="결제 진행 상태">
      <div className={styles.topbarTitle}>
        {/* 로고나 제목이 필요하면 여기에 추가 멍 */}
      </div>
      <div className={styles.topbarRight}>
        <span className={styles.badge} aria-hidden>SSL Secured</span>
        <span className={styles.badge} aria-hidden>3D Secure</span>
        <span className={styles.timer} aria-live="polite">
          남은 시간 {timeString}
        </span>
      </div>
    </header>
  )
}

export default BookingPaymentHeader
