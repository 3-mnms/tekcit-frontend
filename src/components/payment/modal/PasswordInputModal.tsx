// src/components/payment/modal/PasswordInputModal.tsx
import { useState } from 'react'
import styles from './PasswordInputModal.module.css'
import DotDisplay from '@components/payment/password/DotDisplay'
import Keypad from '@components/payment/password/Keypad'
import { verifyTekcitPassword } from '@/shared/api/payment/tekcit'

interface PasswordInputModalProps {
  onClose: () => void
  onComplete: (password: string) => void
  userName?: string
  amount: number
  paymentId: string
  userId: number             // ✅ 추가: 헤더용
}

const PasswordInputModal: React.FC<PasswordInputModalProps> = ({
  onComplete, onClose, userName, amount, paymentId, userId,
}) => {
  const [password, setPassword] = useState('')
  const [isError, setIsError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleKeyPress = async (value: string) => {
    if (isSubmitting) return
    if (value === '전체삭제') { setPassword(''); setIsError(false); return }
    if (value === '삭제') { setPassword((prev) => prev.slice(0, -1)); setIsError(false); return }
    if (!/^\d$/.test(value) || password.length >= 6) return

    const next = password + value
    setPassword(next); setIsError(false)

    if (next.length === 6) {
      setIsSubmitting(true)
      try {
        await verifyTekcitPassword({ amount, paymentId, password: next }, userId)
        setTimeout(() => {
          onComplete(next)
          setPassword('')
          setIsError(false)
        }, 120)
      } catch {
        setIsError(true)
        setTimeout(() => setPassword(''), 300)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose} aria-label="비밀번호 입력 닫기" disabled={isSubmitting}>✕</button>

        <div className={styles.top}>
          {userName && <p className={styles.label}>{userName}님의</p>}
          <h2 className={styles.title}>비밀번호를 입력하세요</h2>
          <DotDisplay length={password.length} />
          {isError && <p className={styles.errorMessage}>비밀번호가 일치하지 않습니다.</p>}
        </div>

        <div className={styles.keypadWrapper}>
          <Keypad onPress={handleKeyPress} disabled={isSubmitting} />
        </div>
      </div>
    </div>
  )
}

export default PasswordInputModal
