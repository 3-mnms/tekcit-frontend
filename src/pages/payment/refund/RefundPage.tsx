import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import styles from './RefundPage.module.css'

import TransferTicketInfo from '@/components/payment/refund/RefundTicketInfo'
import Button from '@/components/common/button/Button'
import AlertModal from '@/components/common/modal/AlertModal'

const RefundPage: React.FC = () => {
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
  const navigate = useNavigate()

  // ✅ 공통 결과 페이지 이동 헬퍼 멍
  const routeToResult = useCallback((ok: boolean) => {
    const q = new URLSearchParams({
      type: 'refund',
      status: ok ? 'success' : 'fail',
    }).toString()
    navigate(`/payment/result?${q}`)
  }, [navigate])

  // ✅ 모의 환불 API: URL에 ?fail=1이면 실패 처리 멍
  const requestRefund = async () => {
    await new Promise((r) => setTimeout(r, 400))
    const params = new URLSearchParams(window.location.search)
    const forceFail = params.get('fail') === '1'
    return { ok: !forceFail }
  }

  const handleCancel = () => navigate('/mypage/ticket')
  const handleRefundClick = () => setIsRefundModalOpen(true)

  const handleRefundConfirm = async () => {
    setIsRefundModalOpen(false)
    try {
      const res = await requestRefund()
      routeToResult(res.ok)
    } catch {
      routeToResult(false)
    }
  }

  const handleRefundModalCancel = () => setIsRefundModalOpen(false)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>취소 요청</h1>
        <p className={styles.subtitle}>
          환불 내용을 확인한 뒤 진행해 주세요.
        </p>
      </header>

      {/* 예매 정보 카드 멍 */}
      <TransferTicketInfo
        title="하울의 움직이는 성"
        date="2025.09.21 (일) 오후 3시"
        ticket={2}
        sender="정혜영"
        receiver="김민정"
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

      {/* 하단 고정 액션 영역 멍 */}
      <div className={styles.actions} role="group" aria-label="환불 진행">
        <Button className={`${styles.btn} ${styles.btnGhost}`} onClick={handleCancel}>
          환불 취소
        </Button>
        <Button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleRefundClick}>
          환불
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
