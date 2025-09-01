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

  useEffect(() => {
    setRemaining(initialSeconds)
    expiredRef.current = false // 만료 플래그도 초기화 멍
  }, [initialSeconds])

  const expiredRef = useRef(false)

  // ✅ 남은 시간 MM:SS 문자열
  const timeString = useMemo(() => {
    const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
    const ss = String(remaining % 60).padStart(2, '0')
    return `${mm}:${ss}`
  }, [remaining])

    useEffect(() => {
    if (remaining <= 0) return
    const id = setInterval(() => {
      setRemaining((s) => Math.max(0, s - 1)) // 렌더 바깥(타이머)에서만 감소 멍
    }, 1000)
    return () => clearInterval(id)
  }, [remaining])

  useEffect(() => {
    // 매초 콜백(필요 시 부모에서 setState OK — 렌더가 끝난 뒤라 안전) 멍
    onTick?.(remaining)

    // 만료 시 한 번만 호출 멍
    if (remaining === 0 && !expiredRef.current) {
      expiredRef.current = true
      onExpire?.()
    }
  }, [remaining, onTick, onExpire])

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
