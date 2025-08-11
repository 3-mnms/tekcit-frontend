// src/components/common/modal/AlertModal.tsx

import Button from '@/components/common/button/Button'
import styles from '@pages/payment/modal/AlertModal.module.css'

interface AlertModalProps {
  title?: string
  children?: React.ReactNode
  confirmText?: string
  cancelText?: string
  onCancel: () => void
  onConfirm: () => void
}

const AlertModal: React.FC<AlertModalProps> = ({
  title = '알림',
  children,
  confirmText = '확인',
  cancelText = '취소',
  onCancel,
  onConfirm,
}) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.message}>
          {children}
        </div>
        <div className={styles.buttons}>
          <Button onClick={onCancel} className={styles.button}>
            {cancelText}
          </Button>
          <Button onClick={onConfirm} className={styles.button}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AlertModal
