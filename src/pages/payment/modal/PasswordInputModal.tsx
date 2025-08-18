import { useState } from 'react'
import styles from './PasswordInputModal.module.css'
import DotDisplay from '@components/payment/password/DotDisplay'
import Keypad from '@components/payment/password/Keypad'

interface PasswordInputModalProps {
  onClose: () => void
  onComplete: (password: string) => void
}

const PasswordInputPage: React.FC<PasswordInputModalProps> = ({ onComplete, onClose }) => {
  const [password, setPassword] = useState<string>('')
  const [isError, setIsError] = useState(false)


  const handleKeyPress = (value: string) => {
    if (value === '전체삭제') {
      setPassword('')
      setIsError(false)
    } else if (value === '삭제') {
      setPassword((prev) => prev.slice(0, -1))
      setIsError(false)
    } else if (password.length < 6) {
      const newPassword = password + value
      setPassword(newPassword)

      if (newPassword.length === 6) {
        // ✅ 여기서 비밀번호 검사
        const isCorrect = newPassword === '123456' // ← 임시

        if (isCorrect) {
          setTimeout(() => {
            onComplete(newPassword)
            setPassword('')
            setIsError(false)
          }, 300)
        } else {
          setIsError(true)
          setTimeout(() => {
            setPassword('')
          }, 500)
        }
      }
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* ✅ 닫기 버튼을 맨 위에 배치 */}
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>

        <div className={styles.top}>
          <p className={styles.label}>김민정님의</p>
          <h2 className={styles.title}>비밀번호 입력</h2>
          <DotDisplay length={password.length} />

          {isError && (
            <p className={styles.errorMessage}>비밀번호가 일치하지 않습니다.</p>
          )}
          
          <button className={styles.reset}>비밀번호 재설정 &gt;</button>
        </div>

        <div className={styles.keypadWrapper}>
          <Keypad onPress={handleKeyPress} />
        </div>
      </div>
    </div>
  )
}

export default PasswordInputPage
