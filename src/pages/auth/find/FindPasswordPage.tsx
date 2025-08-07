// pages/FindPasswordPage.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '@assets/logo.png'
import Button from '@/components/common/button/Button'
import styles from './FindPasswordPage.module.css'

const FindPasswordPage: React.FC = () => {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [showVerification, setShowVerification] = useState(false)
  const [code, setCode] = useState('')
  const [verificationMessage, setVerificationMessage] = useState('')

  const handleSendCode = () => {
    // 임시 인증번호 전송
    setShowVerification(true)
    setVerificationMessage('') // 이전 메시지 초기화
  }

  const handleVerifyCode = () => {
    if (code === '123456') {
      setVerificationMessage('✅ 인증번호가 확인되었습니다.')
      setTimeout(() => {
        navigate('/reset-password')
      }, 1000)
    } else {
      setVerificationMessage('❌ 인증번호가 일치하지 않습니다.')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <img src={Logo} alt="tekcit logo" className={styles.logo} />
        <h2 className={styles.title}>비밀번호 찾기</h2>

        <input
          type="text"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="아이디"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className={styles.input}
        />
        <div className={styles.emailRow}>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
          <Button onClick={handleSendCode} className="text-sm w-[120px] h-[42px]">
            인증 전송
          </Button>
        </div>

        {showVerification && (
          <>
            <div className={styles.emailRow}>
              <input
                type="text"
                placeholder="인증번호 입력"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={styles.input}
              />
              <Button onClick={handleVerifyCode} className="text-sm w-[120px] h-[42px]">
                인증 확인
              </Button>
            </div>
            {verificationMessage && (
              <p className={styles.verificationMessage}>{verificationMessage}</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default FindPasswordPage