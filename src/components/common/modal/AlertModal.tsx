// 알림 모달 공통 컴포넌트
// 버튼 기본값: '확인'/'취소'
// 타이틀 기본값: '알림'
// 취소 버튼 숨김 옵션: hideCancel (true -> 취소 버튼 숨김)

import Button from '@/components/common/button/Button'
import styles from '@/components/common/modal/AlertModal.module.css'

interface AlertModalProps {
  title?: string
  children?: React.ReactNode
  confirmText?: string
  cancelText?: string
  onCancel?: () => void
  onConfirm: () => void
  hideCancel?: boolean
}

const AlertModal: React.FC<AlertModalProps> = ({
  title = '알림',
  children,
  confirmText = '확인',
  cancelText = '취소',
  onCancel,
  onConfirm,
  hideCancel = false,
}) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.message}>{children}</div>
        <div className={styles.buttons}>
          {!hideCancel && ( // hideCancel true -> 취소 버튼 숨김
            <Button onClick={onCancel} className={styles.button}>
              {cancelText}
            </Button>
          )}
          <Button onClick={onConfirm} className={styles.button}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AlertModal
