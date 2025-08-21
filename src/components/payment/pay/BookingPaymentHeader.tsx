import React from 'react'
import styles from '@/components/payment/pay/BookingPaymentHeader.module.css'

interface BookingPaymentHeaderProps {
  timeString: string // 남은 시간 (MM:SS)
}

const BookingPaymentHeader: React.FC<BookingPaymentHeaderProps> = ({ timeString }) => {
  return (
    <div className={styles.header}>
      <div className={styles.right}>
        <span className={styles.label}>남은 시간</span>
        <span className={styles.time}>{timeString}</span>
      </div>
    </div>

  )
}

export default BookingPaymentHeader
