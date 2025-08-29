// src/components/my/ticket/PaymentInfoSection.tsx
import React, { useMemo } from 'react'
import { usePaymentOrdersQuery } from '@/models/my/ticket/tanstack-query/usePaymentOrders'
import styles from './PaymentInfoSection.module.css'

type Props = {
  festivalId: string
  reservationNumber: string
}

const methodLabel = (m?: string) => {
  switch (m) {
    case 'CARD':
      return '신용/체크카드'
    case 'POINT_PAYMENT':
      return '포인트 결제'
    case 'POINT_CHARGE':
      return '포인트 충전'
    default:
      return m ?? '-'
  }
}

const krw = (n?: number | null, currency?: string) => {
  if (typeof n !== 'number') return '-'
  if (currency && currency !== 'KRW') return `${n.toLocaleString('ko-KR')} ${currency}`
  return n.toLocaleString('ko-KR') + '원'
}

const toDotYMD = (iso?: string) => {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd}`
}

const PaymentInfoSection: React.FC<Props> = ({ festivalId, reservationNumber }) => {
  const { data: list, isLoading, isError, error } = usePaymentOrdersQuery(festivalId)

  const order = useMemo(() => {
    if (!list || list.length === 0) return undefined
    return [...list].sort((a, b) => {
      const ta = new Date(a.payTime as unknown as string).getTime()
      const tb = new Date(b.payTime as unknown as string).getTime()
      return tb - ta // desc
    })[0]
  }, [list])

  const fee = 0
  const delivery = 0
  const subtotal = order?.amount ?? 0
  const total = subtotal + fee + delivery

  return (
    <div>
      <h3 className={styles.title}>결제내역</h3>

      {isLoading && <div className={styles.loading}>불러오는 중…</div>}
      {isError && (
        <div className={styles.error}>
          불러오기 실패: {(error as Error)?.message ?? '알 수 없는 오류'}
        </div>
      )}
      {!isLoading && !isError && !order && (
        <div className={styles.empty}>이 예매번호에 해당하는 결제내역이 없습니다.</div>
      )}

      {order && (
        <div className={styles.wrapper}>
          <table className={styles.sharedTable}>
            <colgroup>
              <col style={{ width: '16.6%' }} />
              <col style={{ width: '16.6%' }} />
              <col style={{ width: '16.6%' }} />
              <col style={{ width: '16.6%' }} />
              <col style={{ width: '16.6%' }} />
              <col style={{ width: '16.6%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>예매일</th>
                <th>결제수단</th>
                <th>현재상태</th>
                <th>결제상태</th>
                <th>예매번호</th>
                <th>가격</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{toDotYMD(order.payTime as unknown as string)}</td>
                <td>{methodLabel(order.payMethod as unknown as string)}</td>
                <td>-</td>
                <td>-</td>
                <td>{reservationNumber}</td>
                <td>{krw(order.amount, order.currency)}</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.paymentSummary}>
            <div className={styles.row}>
              <span>예매 수수료</span>
              <span>{krw(fee, order.currency)}</span>
            </div>
            <div className={styles.row}>
              <span>배송비</span>
              <span>{krw(delivery, order.currency)}</span>
            </div>
            <div className={`${styles.row} ${styles.total}`}>
              <span>총 결제금액</span>
              <span>{krw(total, order.currency)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentInfoSection
