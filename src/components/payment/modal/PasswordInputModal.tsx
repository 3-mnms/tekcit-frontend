// 파일: src/components/payment/modal/PasswordInputModal.tsx

import { useState } from 'react'
import styles from './PasswordInputModal.module.css'
import DotDisplay from '@components/payment/password/DotDisplay'
import Keypad from '@components/payment/password/Keypad'
import { verifyTekcitPassword } from '@/shared/api/payment/tekcit'

interface PasswordInputModalProps {
  onClose: () => void                    // 주석: 모달 닫기 콜백 멍
  onComplete: (password: string) => void // 주석: 부모에게 성공 PIN 전달 멍
  userName?: string                      // 주석: 사용자명 표시(선택) 멍
  amount: number                         
  paymentId: string                      
}

const PasswordInputModal: React.FC<PasswordInputModalProps> = ({
  onComplete,
  onClose,
  userName,
  amount,
  paymentId,
}) => {
  const [password, setPassword] = useState<string>('')   // 주석: 6자리 PIN 버퍼 멍
  const [isError, setIsError] = useState(false)          // 주석: 오류 표시 플래그 멍
  const [isSubmitting, setIsSubmitting] = useState(false)// 주석: 중복 제출 방지 멍

  /** 주석: 키패드 입력 처리 멍 */
  const handleKeyPress = async (value: string) => {
    if (isSubmitting) return

    if (value === '전체삭제') {
      setPassword('')
      setIsError(false)
      return
    }
    if (value === '삭제') {
      setPassword((prev) => prev.slice(0, -1))
      setIsError(false)
      return
    }
    if (!/^\d$/.test(value)) return
    if (password.length >= 6) return

    const next = password + value
    setPassword(next)
    setIsError(false)

    // 주석: 6자리 모두 입력 시 서버로 검증+결제 실행 멍
    if (next.length === 6) {
      setIsSubmitting(true)
      try {
        await verifyTekcitPassword({ amount, paymentId, password: next }) // ✅ 핵심 변경점 멍
        // 주석: 서버에서 200 응답이면 성공 처리 멍
        setTimeout(() => {
          onComplete(next)   // 주석: 부모에 성공 알림(후속 결제 상태 업데이트 등) 멍
          setPassword('')
          setIsError(false)
        }, 120)
      } catch (e) {
        // 주석: 400/401/409 등 실패 시 에러 상태 표시 후 입력 초기화 멍
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
        {/* 주석: 닫기 버튼 멍 */}
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="비밀번호 입력 닫기"
          disabled={isSubmitting}
        >
          ✕
        </button>

        <div className={styles.top}>
          {userName && <p className={styles.label}>{userName}님의</p>}
          <h2 className={styles.title}>비밀번호를 입력하세요</h2>
          <DotDisplay length={password.length} />

          {isError && (
            <p className={styles.errorMessage}>
              비밀번호가 일치하지 않습니다.
            </p>
          )}
        </div>

        <div className={styles.keypadWrapper}>
          <Keypad onPress={handleKeyPress} disabled={isSubmitting} />
        </div>
      </div>
    </div>
  )
}

export default PasswordInputModal
