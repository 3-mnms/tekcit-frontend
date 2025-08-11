import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import styles from './RefundPage.module.css'

import TransferTicketInfo from '@/components/payment/refund/RefundTicketInfo'
import Button from '@/components/common/button/Button'
import AlertModal from '@/pages/payment/modal/AlertModal'

const RefundPage: React.FC = () => {
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
  const navigate = useNavigate()

  // ✅ 모의 환불 API: URL에 ?fail=1이면 실패 처리
  const requestRefund = async () => {
    await new Promise((r) => setTimeout(r, 400)) // 로딩 흉내
    const params = new URLSearchParams(window.location.search)
    const forceFail = params.get('fail') === '1'
    return { ok: !forceFail }
  }

  const handleCancel = () => {
    navigate('/mypage/ticket')
  }

  const handleRefundClick = () => {
    setIsRefundModalOpen(true)
  }

  // ✅ 성공/실패 분기하여 각각 페이지로 이동
  const handleRefundConfirm = async () => {
    setIsRefundModalOpen(false)
    try {
      const res = await requestRefund()
      if (res.ok) {
        navigate('/payment/refund/refund-success')
      } else {
        navigate('/payment/refund/refund-fail')
      }
    } catch {
      navigate('/payment/refund/refund-fail')
    }
  }

  const handleRefundModalCancel = () => {
    setIsRefundModalOpen(false)
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>취소 요청</h1>

      <TransferTicketInfo
        title="하울의 움직이는 성"
        date="2025.09.21 (일) 오후 3시"
        ticket={2}
        sender="정혜영"
        receiver="김민정"
      />

      <div className={styles.refundBox}>
        <div className={styles.row}>
          <span className={styles.label}>최종 환불 예정 금액</span>
          <span className={styles.value}>100,000원</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>환불 수수료</span>
          <span className={styles.value}>2,000원</span>
        </div>
        <div className={styles.rowTotal}>
          <span className={styles.totalLabel}>결제 금액</span>
          <span className={styles.totalValue}>102,000원</span>
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <Button className="w-36 h-12" onClick={handleCancel}>
          환불 취소
        </Button>
        <Button className="w-36 h-12" onClick={handleRefundClick}>
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
