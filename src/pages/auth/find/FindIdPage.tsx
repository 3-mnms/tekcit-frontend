import React, { useState } from 'react'
import { FaRegCopy } from 'react-icons/fa6'
import Logo from '@assets/logo.png'
import Button from '@/components/common/button/Button'
import styles from './FindIdPage.module.css'

const FindIdPage: React.FC = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [foundId, setFoundId] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleFindId = () => {
    if (email === 'test@example.com' && name === 'test') {
      setFoundId('tekcit_user01')
      setNotFound(false)
    } else {
      setFoundId(null)
      setNotFound(true)
    }
    setCopied(false) 
  }

  const handleGoToLogin = () => {
    window.location.href = '/login'
  }

  const handleCopy = async () => {
    if (foundId) {
      await navigator.clipboard.writeText(foundId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // 2초 후 복사 상태 초기화
    }
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
            <div className={styles.resultRow}>
              <input
                type="text"
                className={styles.resultInput}
                value={foundId}
                readOnly
              />
              <button onClick={handleCopy} className={styles.copyButton}>
                <FaRegCopy />
              </button>
            </div>
            {copied && <p className={styles.copied}>아이디가 복사되었어요!</p>}
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