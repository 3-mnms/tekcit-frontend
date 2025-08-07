import React, { useState } from 'react'
import Logo from '@assets/logo.png'
import Button from '@/components/common/button/Button'
import styles from './FindIdPage.module.css'

const FindIdPage: React.FC = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [foundId, setFoundId] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  const handleFindId = () => {
    // 예시 데이터
    if (email === 'test@example.com' && name === '홍길동') {
      setFoundId('tekcit_user01')
      setNotFound(false)
    } else {
      setFoundId(null)
      setNotFound(true)
    }
  }

  const handleGoToLogin = () => {
    window.location.href = '/login'
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <img src={Logo} alt="tekcit logo" className={styles.logo} />
        <h2 className={styles.title}>아이디 찾기</h2>

        <input
          type="text"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
        />

        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />

        <Button onClick={handleFindId} className="w-full h-11 mt-2">
          아이디 찾기
        </Button>

        {/* 아이디 찾음 */}
        {foundId && (
          <>
            <input
              type="text"
              className={styles.resultInput}
              value={foundId}
              readOnly
            />
            <Button onClick={handleGoToLogin} className="w-full h-11 mt-2">
              로그인 하기
            </Button>
          </>
        )}

        {/* 못 찾음 */}
        {notFound && (
          <p className={styles.error}>일치하는 정보가 없습니다.</p>
        )}
      </div>
    </div>
  )
}

export default FindIdPage