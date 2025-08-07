// pages/ResetPasswordPage.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '@assets/logo.png'
import Button from '@/components/common/button/Button'
import styles from './ResetPasswordPage.module.css'

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleReset = () => {
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.')
      return
    }

    console.log('새 비밀번호:', password)
    alert('비밀번호가 성공적으로 변경되었습니다!')
    navigate('/login')
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <img src={Logo} alt="tekcit logo" className={styles.logo} />
        <h2 className={styles.title}>비밀번호 재설정</h2>

        <input
          type="password"
          placeholder="새 비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
        />
        <input
          type="password"
          placeholder="새 비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={styles.input}
        />

        <Button onClick={handleReset} className="w-full h-11 mt-2">
          비밀번호 변경
        </Button>
      </div>
    </div>
  )
}

export default ResetPasswordPage
