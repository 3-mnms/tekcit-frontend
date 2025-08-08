import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import styles from './RefundPage.module.css'

import TransferTicketInfo from '@/components/payment/refund/RefundTicketInfo'
import Button from '@/components/common/button/Button'
import AlertModal from '@/pages/payment/modal/AlertModal'

const RefundPage: React.FC = () => {
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
  const navigate = useNavigate()

  // ⬇️ 환불 취소 버튼 클릭 시 내 티켓(예매 내역) 페이지로 이동!
  const handleCancel = () => {
    navigate('/mypage/ticket')
  }

  const handleRefundClick = () => {
    setIsRefundModalOpen(true)
  }

  const handleRefundConfirm = () => {
    setIsRefundModalOpen(false)
    // 환불 완료 페이지로 이동!
    navigate('/payment/refund/refund-success') 
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

      {/* 환불 확인 모달 */}
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
