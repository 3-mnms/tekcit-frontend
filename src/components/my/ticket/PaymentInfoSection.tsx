// 모바일 카드형 결제내역 (참고 코드 스타일 적용)
import React, { useMemo } from 'react'
import { usePaymentOrdersQuery } from '@/models/my/ticket/tanstack-query/usePaymentOrders'
import styles from './PaymentInfoSection.module.css'
import { useNavigate } from 'react-router-dom'
import Spinner from '@/components/common/spinner/Spinner'
import { Calendar, CreditCard, Receipt, RefreshCw } from 'lucide-react'

type Props = {
  bookingId: string
  reservationNumber: string
  qrUsed: boolean
}

const methodLabel = (m?: string) => {
  switch (m) {
    case 'CARD':
      return '신용/체크카드'
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
    return [...input].sort((a, b) => {
      const ta = new Date(String(a.payTime ?? a.createdAt ?? 0)).getTime()
      const tb = new Date(String(b.payTime ?? b.createdAt ?? 0)).getTime()
      return tb - ta
    })[0]
  }
  const wrapped = input?.content ?? input?.data?.content ?? input?.data ?? input
  if (Array.isArray(wrapped)) return normalizeOrder(wrapped)
  if (wrapped && typeof wrapped === 'object') return wrapped
  return undefined
}

const PaymentInfoSection: React.FC<Props> = ({ bookingId, reservationNumber, qrUsed }) => {
  const navigate = useNavigate()
  const { data, isLoading, isError } = usePaymentOrdersQuery(bookingId)
  const order = useMemo(() => normalizeOrder(data), [data])

  const getMethodIcon = (m?: string) => {
    const label = methodLabel(m)
    if (label.includes('포인트')) return <Receipt className={styles.icon16} />
    if (label.includes('신용') || label.includes('체크카드'))
      return <CreditCard className={styles.icon16} />
    return <RefreshCw className={styles.icon16} />
  }

  // 상태 pill 텍스트/스타일
  const status = (order?.paymentStatus ?? '').toLowerCase()
  const isCanceled = status === 'canceled' || status === 'cancelled'
  const isPaid = status === 'paid'
  const statusText = isPaid ? '결제완료' : isCanceled ? '환불완료' : '결제대기'

  const isQrUsed = useMemo(() => {
    const v = String(qrUsed ?? '')
      .trim()
      .toLowerCase()
    return v === 'true' || v === 'y' || v === 'yes' || v === '1'
  }, [qrUsed])

  const canRefund = Boolean(order?.paymentId) && isPaid && !isCanceled && !isQrUsed

  const onRefund = () => {
    if (!canRefund) return
    const paymentId = order.paymentId ?? order.id ?? order.paymentid
    if (!paymentId) return
    navigate(`/payment/refund/${paymentId}`, {
      state: {
        paymentId,
        paymentAmount: order.amount,
        currency: order.currency ?? 'KRW',
      },
    })
  }

  if (isLoading) {
    return (
      <section className={styles.card} aria-label="결제내역">
        <Spinner />
      </section>
    )
  }
  if (isError) {
    return (
      <section className={styles.card} aria-label="결제내역">
        <div className={styles.head}>
          <div className={styles.headL}>
            <span className={styles.iconBadge}>
              <Receipt className={styles.icon14} />
            </span>
            <span className={styles.headTitle}>예매 결제내역</span>
          </div>
          <span className={`${styles.pill} ${styles.pillGray}`}>결제대기</span>
        </div>
        <div className={styles.emptyBox}>결제 내역을 불러오지 못했어요.</div>
      </section>
    )
  }
  if (!order) {
    return (
      <section className={styles.card} aria-label="결제내역">
        <div className={styles.head}>
          <div className={styles.headL}>
            <span className={styles.iconBadge}>
              <Receipt className={styles.icon14} />
            </span>
            <span className={styles.headTitle}>예매 결제내역</span>
          </div>
          <span className={`${styles.pill} ${styles.pillGray}`}>결제대기</span>
        </div>
        <div className={styles.emptyBox}>이 예매번호에 해당하는 결제내역이 없습니다.</div>
      </section>
    )
  }

  return (
    <section className={styles.card} aria-label="결제내역">
      <div className={styles.head}>
        <div className={styles.headL}>
          <span className={styles.iconBadge}>
            <Receipt className={styles.icon14} />
          </span>
          <span className={styles.headTitle}>예매 결제내역</span>
        </div>
        <span
          className={`${styles.pill} ${
            isPaid ? styles.pillPrimary : isCanceled ? styles.pillGray : styles.pillSecondary
          }`}
        >
          {statusText}
        </span>
      </div>

      <div className={styles.grid}>
        <div className={styles.item}>
          <Calendar className={styles.icon18Muted} />
          <div>
            <p className={styles.k}>예매일</p>
            <p className={styles.v}>{toDotYMD(order.payTime as string)}</p>
          </div>
        </div>

        <div className={styles.item}>
          <span className={styles.icon18Wrap}>{getMethodIcon(order.payMethod)}</span>
          <div>
            <p className={styles.k}>결제수단</p>
            <p className={styles.v}>{methodLabel(order.payMethod as string)}</p>
          </div>
        </div>

        <div className={styles.item}>
          <Receipt className={styles.icon18Muted} />
          <div>
            <p className={styles.k}>예매번호</p>
            <p className={`${styles.v} ${styles.mono}`}>{reservationNumber}</p>
          </div>
        </div>

        <div className={styles.item}>
          <span className={styles.wonCircle}>₩</span>
          <div>
            <p className={styles.k}>결제금액</p>
            <p className={styles.priceBlue}>{krw(order.amount, order.currency)}</p>
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.actions}>
        {isCanceled ? (
          <span className={styles.badgeGray}>환불완료</span>
        ) : isQrUsed ? (
          <span className={styles.badgeGray}>사용완료 · 환불불가</span>
        ) : (
          <button
            type="button"
            onClick={onRefund}
            disabled={!canRefund}
            className={styles.refundBtn}
          >
            환불하기
          </button>
        )}
      </div>
    </section>
  )
}

export default PaymentInfoSection
