import Button from '@/components/common/button/Button'
import styles from '@pages/payment/ConfirmModal.module.css'

interface ConfirmModalProps {
  onCancel: () => void
  onConfirm: () => void
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ onCancel, onConfirm }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>결제 알림</h2>
        <div className={styles.message}>
          <p>양도 취소 불가합니다</p>
        </div>
        <div className={styles.buttons}>
          <Button onClick={onCancel} className={styles.button}>
            취소
          </Button>
          <Button onClick={onConfirm} className={styles.button}>
            결제
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
