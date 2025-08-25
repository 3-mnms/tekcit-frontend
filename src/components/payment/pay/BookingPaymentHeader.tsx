import { useEffect, useMemo, useRef, useState } from 'react'
import styles from '@/components/payment/pay/BookingPaymentHeader.module.css'

interface BookingPaymentHeaderProps {
  initialSeconds: number
  onTick?: (remaining: number) => void
  onExpire?: () => void
}

const BookingPaymentHeader: React.FC<BookingPaymentHeaderProps> = ({
  initialSeconds,
  onTick,
  onExpire,
}) => {
  // ✅ 남은 시간 상태
  const [remaining, setRemaining] = useState<number>(initialSeconds)

  // ✅ 남은 시간 MM:SS 문자열
  const timeString = useMemo(() => {
    const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
    const ss = String(remaining % 60).padStart(2, '0')
    return `${mm}:${ss}`
  }, [remaining])

  const expiredRef = useRef(false)

  useEffect(() => {
    // ✅ 1초마다 감소
    const id = setInterval(() => {
      setRemaining(prev => {
        const next = Math.max(0, prev - 1)
        // 매 초 콜백
        onTick?.(next)

        if (next === 0 && !expiredRef.current) {
          expiredRef.current = true
          onExpire?.()
          clearInterval(id)
        }
        return next
      })
    }, 1000)

    return () => clearInterval(id)
  }, [onTick, onExpire])

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
