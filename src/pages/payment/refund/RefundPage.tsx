import { useState, useCallback, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styles from './RefundPage.module.css'

import TransferTicketInfo from '@/components/payment/refund/RefundTicketInfo'
import Button from '@/components/common/button/Button'
import AlertModal from '@/components/common/modal/AlertModal'

const RefundPage: React.FC = () => {
  // ✅ 모달/로딩 상태
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
  const [loadingRefund, setLoadingRefund] = useState(false)

  // ✅ 취소 사유 입력 상태
  const [reason, setReason] = useState<string>('')              // 사용자가 입력한 취소 사유
  const REASON_MINLEN = 10                                      // 최소 글자 수
  const REASON_MAXLEN = 200                                     // 최대 글자 수(텍스트 제한)

  const navigate = useNavigate()

  // ✅ path(:paymentId) > query(?paymentId=) > state 순으로 처리
  const { paymentId: paymentIdFromPath } = useParams<{ paymentId: string }>()
  const location = useLocation()
  const qs = useMemo(() => new URLSearchParams(location.search), [location.search])
  const paymentId =
    paymentIdFromPath || qs.get('paymentId') || (location.state as any)?.paymentId || ''

  // ✅ 환불 처리 후 결과 페이지 이동
  const routeToResult = useCallback(
    (ok: boolean) => {
      const q = new URLSearchParams({
        type: 'refund',
        status: ok ? 'success' : 'fail',
      }).toString()
      navigate(`/payment/result?${q}`)
    },
    [navigate],
  )

  const handleCancel = () => navigate(-1)
  const handleRefundClick = () => setIsRefundModalOpen(true)

  /** ✅ 환불 확정 → 바로 성공 화면으로 이동 (API 호출 제거)
   *  - 실제 연동 시 여기서 reason을 함께 전달하면 됨
   */
  const handleRefundConfirm = async () => {
    setIsRefundModalOpen(false)
    setLoadingRefund(true)

    // TODO: 실제 API가 생기면 아래처럼 body에 포함해서 전달
    // await api.post('/payments/refund', { paymentId, reason })

    // 데모: 살짝 지연 후 성공
    setTimeout(() => {
      // 참고용: 서버 로그 대용
      console.log('[Refund Confirmed]', { paymentId, reason })
      routeToResult(true)
      setLoadingRefund(false)
    }, 500)
  }

  const handleRefundModalCancel = () => setIsRefundModalOpen(false)

  // ✅ 환불 버튼 활성화 조건: 로딩 X, paymentId 존재, 사유 최소 글자 수 충족
  const canRefund =
    !loadingRefund && !!paymentId && reason.trim().length >= REASON_MINLEN

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

      {/* ✅ 취소 사유 입력 영역 */}
      <section className={styles.reasonSection} aria-labelledby="refund-reason-label">
        <div className={styles.reasonHead}>
          <label id="refund-reason-label" className={styles.reasonLabel}>
            취소 사유
          </label>
          <span
            className={styles.counter}
            aria-live="polite"
          >
            {reason.length}/{REASON_MAXLEN}
          </span>
        </div>

        <textarea
          className={styles.textarea}
          placeholder="취소 사유를 작성해 주세요. (최소 10자)"
          value={reason}
          maxLength={REASON_MAXLEN}
          onChange={(e) => setReason(e.target.value)}
          aria-invalid={reason.trim().length > 0 && reason.trim().length < REASON_MINLEN}
          aria-describedby="refund-reason-help"
        />
        <p id="refund-reason-help" className={styles.helper}>
          {reason.trim().length < REASON_MINLEN
            ? `최소 ${REASON_MINLEN}자 이상 입력해야 합니다.`
            : '좋습니다. 환불 버튼으로 진행할 수 있습니다.'}
        </p>
      </section>

      {/* 금액 요약 */}
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
          disabled={!canRefund}              // 🔒 사유 미입력/부족 시 비활성화
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
          {/* ✅ 모달에 사용자가 입력한 사유를 함께 보여줌 */}
          <p className={styles.modalText}>
            아래의 사유로 환불을 진행할까요?
          </p>
          <blockquote className={styles.reasonPreview}>
            {reason || '사유 없음'}
          </blockquote>
        </AlertModal>
      )}
    </div>
  )
}

export default RefundPage
