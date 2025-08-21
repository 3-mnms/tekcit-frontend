import { useState, useCallback, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styles from './RefundPage.module.css'

import TransferTicketInfo from '@/components/payment/refund/RefundTicketInfo'
import Button from '@/components/common/button/Button'
import AlertModal from '@/components/common/modal/AlertModal'
import { requestFullRefund } from '@/shared/api/payment/payment' // ✅ 분리한 API 사용

const RefundPage: React.FC = () => {
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
  const [loadingRefund, setLoadingRefund] = useState(false)
  const [setRefundError] = useState<string | null>(null)
  const navigate = useNavigate()

  // ✅ path(:paymentId) > query(?paymentId=) > state 순으로 처리
  const { paymentId: paymentIdFromPath } = useParams<{ paymentId: string }>()
  const location = useLocation()
  const qs = useMemo(() => new URLSearchParams(location.search), [location.search])
  const paymentId =
    paymentIdFromPath || qs.get('paymentId') || (location.state as any)?.paymentId || ''

  const routeToResult = useCallback((ok: boolean) => {
    const q = new URLSearchParams({ type: 'refund', status: ok ? 'success' : 'fail' }).toString()
    navigate(`/payment/result?${q}`)
  }, [navigate])

  const handleCancel = () => navigate('/mypage/ticket')
  const handleRefundClick = () => setIsRefundModalOpen(true)

  /** ✅ 환불 확정 → 분리된 API 호출 */
  const handleRefundConfirm = async () => {
    setIsRefundModalOpen(false)
    setRefundError(null)
    setLoadingRefund(true)
    try {
      if (!paymentId) throw new Error('잘못된 접근입니다. (paymentId 누락)')
      await requestFullRefund(paymentId) // 🔥 여기만 호출하면 끝
      routeToResult(true)
    } catch (e: any) {
      const serverMsg = e?.response?.data?.message
      setRefundError(serverMsg || e?.message || '환불 요청 중 오류가 발생했습니다.')
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

      {/* 마이페이지 예매 취소에서 넘겨주는 데이터 넣을 예정 */}
      <TransferTicketInfo
        title="하울의 움직이는 성"
        date="2025.09.21 (일) 오후 3시"
        ticket={2}
        price={150000}
      />

      {/* 금액 요약 멍 */}
      <section className={styles.summary} aria-label="환불 금액 요약">
        <div className={styles.summaryHead}>
          <span className={styles.badge}>요약</span>
          <span className={styles.tip}>수수료 제외 후 환불됩니다.</span>
        </div>

        <dl className={styles.list}>
          <div className={styles.row}>
            <dt className={styles.label}>최종 환불 예정 금액</dt>
            <dd className={styles.value}>100,000원</dd>
          </div>
          <div className={styles.row}>
            <dt className={styles.label}>환불 수수료</dt>
            <dd className={styles.value}>2,000원</dd>
          </div>

          <div role="separator" className={styles.divider} />

          <div className={styles.rowTotal}>
            <dt className={styles.totalLabel}>결제 금액</dt>
            <dd className={styles.totalValue}>102,000원</dd>
          </div>
        </dl>

        <p className={styles.notice}>
          환불은 결제 수단에 따라 영업일 기준 3~5일 소요될 수 있습니다.
        </p>
      </section>

      <div className={styles.actions} role="group" aria-label="환불 진행">
        <Button className={`${styles.btn} ${styles.btnGhost}`} onClick={handleCancel} disabled={loadingRefund}>
          환불 취소
        </Button>
        <Button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={handleRefundClick}
          disabled={loadingRefund || !paymentId} // 🔒 paymentId 없으면 비활성화
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
        >
          정말 환불 하시겠습니까?
        </AlertModal>
      )}
    </div>
  )
}

export default RefundPage
