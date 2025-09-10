// src/pages/payment/refund/RefundPage.tsx
import { useState, useCallback } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styles from './RefundPage.module.css'

import TransferTicketInfo from '@/components/payment/refund/RefundTicketInfo'
import Button from '@/components/common/button/Button'
import AlertModal from '@/components/common/modal/AlertModal'
import { refundPayment } from '@/shared/api/payment/refund'

const RefundPage: React.FC = () => {
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
  const [loadingRefund, setLoadingRefund] = useState(false)

  const navigate = useNavigate()
  const { paymentId: paymentIdFromPath } = useParams<{ paymentId: string }>()
  const location = useLocation()

  const krw = (n: number) => `${(n ?? 0).toLocaleString('ko-KR')}원`

  // ✅ state 로 전달된 값만 사용 (수수료 없음)
  const {
    paymentId: statePaymentId,
    paymentAmount,
    quantity,
    unitPrice,
  } = (location.state || {}) as {
    paymentId?: string
    paymentAmount?: number
    title?: string
    date?: string
    quantity?: number
    unitPrice?: number
  }

  const paymentId = paymentIdFromPath || statePaymentId || ''
  const amount = paymentAmount ?? 0
  const qty = quantity ?? 1
  const perPrice = unitPrice ?? (amount && qty ? Math.floor(amount / qty) : 0)

  const routeToResult = useCallback(
    (ok: boolean) => {
      const q = new URLSearchParams({
        type: 'refund',
        status: ok ? 'success' : 'fail',
      }).toString()
      navigate(`/payment/result?${q}`)
    },
    [navigate]
  )

  const handleCancel = () => navigate(-1)
  const handleRefundClick = () => setIsRefundModalOpen(true)

  const handleRefundConfirm = async () => {
    setIsRefundModalOpen(false)
    setLoadingRefund(true)
    try {
      if (!paymentId) throw new Error('paymentId 누락')
      const response = await refundPayment(paymentId)
      routeToResult(Boolean(response?.success))
    } catch {
      routeToResult(false)
    } finally {
      setLoadingRefund(false)
    }
  }

  const handleRefundModalCancel = () => setIsRefundModalOpen(false)

  return (
    <div className={styles.page} aria-busy={loadingRefund}>
      <header className={styles.header}>
        <h1 className={styles.title}>취소 요청</h1>
        <p className={styles.subtitle}>환불 내용을 확인한 뒤 진행해 주세요.</p>
      </header>

      {/* ✅ 전달받은 예매(상품) 정보 표시 */}
      {(
        <section className={`${styles.card} ${styles.product}`} aria-label="예매 정보">
          <TransferTicketInfo
            ticket={qty}
            price={perPrice}
          />
        </section>
      )}

      {/* 금액 요약 (수수료 없음) */}
      <section className={`${styles.card} ${styles.summary}`} aria-label="환불 금액 요약">
        <div className={styles.summaryHead}>
          <span className={styles.badge}>요약</span>
          <span className={styles.tip}>최종 환불 금액과 동일하게 환불됩니다.</span>
        </div>

        <dl className={styles.list}>
          <div className={styles.row}>
            <dt className={styles.totalLabel}>최종 환불 예정 금액</dt>
            <dd className={`${styles.totalValue} ${styles.amount}`}>{krw(amount)}</dd>
          </div>

          <div role="separator" className={styles.divider} />
        </dl>

        <p className={styles.notice}>
          환불은 결제 수단에 따라 영업일 기준 3~5일 소요될 수 있습니다.
        </p>
      </section>

      <div className={styles.actions} role="group" aria-label="환불 진행">
        <Button
          className={`${styles.btn} ${styles.btnGhost}`}
          onClick={handleCancel}
          disabled={loadingRefund}
        >
          환불 취소
        </Button>
        <Button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={handleRefundClick}
          disabled={loadingRefund || !paymentId}
          aria-busy={loadingRefund}
        >
          {loadingRefund ? '처리 중…' : '환불'}
        </Button>
      </div>

      {isRefundModalOpen && (
        <AlertModal
          title="환불 확인"
          onCancel={handleRefundModalCancel}
          onConfirm={handleRefundConfirm}
          confirmText="확인"
          cancelText="취소"
        />
      )}
    </div>
  )
}

export default RefundPage
