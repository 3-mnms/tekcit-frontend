import styles from './CancelRequestPage.module.css'
import TransferTicketInfo from '@/components/payment/transfer/TransferTicketInfo'
import Button from '@/components/common/button/Button'

const CancelRequestPage: React.FC = () => {
  const handleCancel = () => {
    // 취소 요청 취소 로직
  }

  const handleConfirm = () => {
    // 실제 취소 확정 로직
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>취소 요청</h1>

      <TransferTicketInfo
        title="하울❤️의 움직이는 성🏰"
        date="2025.09.21 (일) 오후 3시"
        seat="R석 1층 B열 13번, R석 1층 B열 14번"
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
        <Button className="w-36 h-12" onClick={handleConfirm}>
          환불
        </Button>
      </div>
    </div>
  )
}

export default CancelRequestPage
