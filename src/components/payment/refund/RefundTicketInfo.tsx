// src/components/payment/refund/RefundTicketInfo.tsx
import React, { useMemo } from 'react'
import styles from './RefundTicketInfo.module.css'
import { z } from 'zod'

interface RefundTicketInfoProps {
  ticket: number   // 매수
  price: number    // 1매 가격(원)
}

const propsSchema = z.object({
  ticket: z.number().int().nonnegative(),
  price: z.number().int().nonnegative(),
})

const RefundTicketInfo: React.FC<RefundTicketInfoProps> = ({ ticket, price }) => {
  // 숫자 → KRW 포맷
  const krw = (n: number) => `${(n ?? 0).toLocaleString('ko-KR')}원`

  // 합계 금액 계산 메모이제이션
  const total = useMemo(() => ticket * price, [ticket, price])

  // 개발 중 잘못된 값이 넘어오면 콘솔 경고
  const parsed = propsSchema.safeParse({ ticket, price })
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.warn('[RefundTicketInfo] invalid props', parsed.error.flatten())
  }

  return (
    <article className={styles.card} aria-label="티켓 요약 정보">
      <header className={styles.head}>
        <span className={styles.badge} aria-label="환불 대상">환불 대상</span>
      </header>

      <dl className={styles.list} role="group" aria-label="티켓 정보">
        <div className={styles.row}>
          <dt className={styles.label}>티켓 매수</dt>
          <dd className={styles.value}>{ticket}</dd>
        </div>
        <div className={styles.row}>
          <dt className={styles.label}>티켓 가격</dt>
          <dd className={styles.valueStrong}>{krw(price)}</dd>
        </div>
      </dl>
    </article>
  )
}

export default RefundTicketInfo
