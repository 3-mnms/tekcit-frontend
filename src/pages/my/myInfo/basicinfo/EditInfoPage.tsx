import React, { useState } from 'react'
import Button from '@/components/common/button/Button'
import Input from '@/components/common/input/Input'
import styles from './EditInfoPage.module.css'

const EditInfoPage: React.FC = () => {
  const [isChangingEmail, setIsChangingEmail] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')

  const handleEmailChangeClick = () => {
    setIsChangingEmail(true)
  }

  const handleSendCode = () => {
    if (!email) return alert('이메일을 입력해주세요!')
    setIsVerifying(true)
  }

  const handleVerifyCode = () => {
    if (!code) return alert('인증 코드를 입력해주세요!')
    alert('인증 완료!')
  }

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>정보 수정</h2>

      <Input label="이름" defaultValue="홍길동" />
      <Input label="생년월일" type="date" defaultValue="2025-07-28" />
      <Input label="성별" type="select" defaultValue="여성" options={['여성', '남성', '기타']} />

      {!isChangingEmail ? (
        <Input
          label="이메일"
          value="a@example.com"
          disabled
          rightElement={
            <Button className={styles.emailButton} onClick={handleEmailChangeClick}>
              이메일 변경
            </Button>
          }
        />
      ) : (
        <>
          <Input
            label="변경할 이메일"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            rightElement={
              <Button className={styles.emailButton} onClick={handleSendCode}>
                인증 코드 전송
              </Button>
            }
          />
          {isVerifying && (
            <div className={styles.authCodeRow}>
              <Input
                placeholder="인증코드를 입력해주세요"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rightElement={
                  <Button className={styles.emailButton} onClick={handleVerifyCode}>
                    인증하기
                  </Button>
                }
              />
            </div>
          )}
        </>
      )}

      <Button className={styles.submitButton}>수정 완료</Button>
    </section>
  )
}

export default EditInfoPage
