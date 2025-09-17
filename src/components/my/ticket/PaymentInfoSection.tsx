// src/components/my/ticket/PaymentInfoSection.tsx
import React, { useMemo } from 'react'
import { usePaymentOrdersQuery } from '@/models/my/ticket/tanstack-query/usePaymentOrders'
import styles from './PaymentInfoSection.module.css'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/common/button/Button'
import Spinner from '@/components/common/spinner/Spinner'

type Props = {
  bookingId: string
  reservationNumber: string
}

const methodLabel = (m?: string) => {
  switch (m) {
    case 'CARD':
      return '신용/체크카드'
    case 'BANK_TRANSFER':
      return '무통장입금/계좌이체'
    case 'KAKAO_PAY':
      return '카카오페이'
    case 'POINT':
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

function normalizeOrder(input: any): any | undefined {
  if (!input) return undefined
  if (Array.isArray(input)) {
    if (input.length === 0) return undefined
    // 최신 1건
    return [...input].sort((a, b) => {
      const ta = new Date(String(a.payTime ?? a.createdAt ?? 0)).getTime()
      const tb = new Date(String(b.payTime ?? b.createdAt ?? 0)).getTime()
      return tb - ta
    })[0]
  }
  // 래퍼 형태 방어
  const wrapped =
    input?.content ??
    input?.data?.content ??
    input?.data ??
    input
  if (Array.isArray(wrapped)) return normalizeOrder(wrapped)
  if (wrapped && typeof wrapped === 'object') return wrapped
  return undefined
}

const PaymentInfoSection: React.FC<Props> = ({ bookingId, reservationNumber }) => {
  const navigate = useNavigate()
  const { data, isLoading, isError } = usePaymentOrdersQuery(bookingId)

  const order = useMemo(() => normalizeOrder(data), [data])

  const fee = 0
  const delivery = 0
  const subtotal = order?.amount ?? 0
  const total = subtotal + fee + delivery

  // ⬇️ status 기반 제어
  const status = (order?.paymentStatus ?? '').toLowerCase()
  const isCanceled = status === 'canceled' || status === 'cancelled' // 혹시 서버 철자 변형 여지 대비
  const isPaid = status === 'paid'
  const canRefund = Boolean(order?.paymentId) && isPaid
  console.log(status)

  const goRefund = () => {
    if (!canRefund || !order?.paymentId) return

    navigate(`/payment/refund/${order.paymentId}`, {
      state: {
        paymentId: order.paymentId,
        paymentAmount: order.amount,
        quantity: order.quantity, 
        unitPrice: order.unitPrice,
      },
    })
  }

  return (
    <div>
      <h3 className={styles.title}>결제내역</h3>

      {isLoading && <Spinner />}
      {isError && (
        <div className={`${styles.card} ${styles.empty}`}>
          <div className={styles.emptyIcon} aria-hidden />
          <h3 className={styles.emptyTitle}>결제 내역이 없습니다</h3>
          <p className={styles.emptyDesc}>양도 받은 티켓은 결제 내역에서 제외됩니다.</p>
        </div>
      )}
      {!isLoading && !isError && !order && (
        <div className={styles.empty}>이 예매번호에 해당하는 결제내역이 없습니다.</div>
      )}

      {order && (
        <div className={styles.wrapper}>
          <table className={styles.sharedTable}>
            <colgroup>
              <col style={{ width: '20%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '20%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>예매일</th>
                <th>결제수단</th>
                <th>예매번호</th>
                <th>가격</th>
                <th>환불</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{toDotYMD(order.payTime as unknown as string)}</td>
                <td>{methodLabel(order.payMethod as unknown as string)}</td>
                <td>{reservationNumber}</td>
                <td>{krw(order.amount, order.currency)}</td>
                <td>
                  {isCanceled ? (
                    <span className={styles.refundBadge}>환불완료</span>
                  ) : (
                    <Button
                      type="button"
                      onClick={goRefund}
                      className={styles.refundBtn}
                      disabled={!canRefund}
                      aria-disabled={!canRefund}
                    >
                      환불하기
                    </Button>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          <div className={styles.paymentSummary}>
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
