// pages/FindPasswordPage.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '@assets/logo.png'
import Button from '@/components/common/button/Button'
import styles from './FindPasswordPage.module.css'
import axios from 'axios'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { findPwEmailSchema, type FindPwEmailForm } from '@/models/auth/schema/findSchema'
import {
  useFindRegisteredEmailMutation,
  useSendPwFindCode,
  useVerifyPwFindCode,
} from '@/models/auth/tanstack-query/useFindLoginInfo'

const maskEmail = (email: string) => {
  const [id, domain] = email.split('@')
  if (!domain) return email
  const head = id.slice(0, Math.min(3, id.length))
  return `${head}${'*'.repeat(Math.max(0, id.length - head.length))}@${domain}`
}

const FindPasswordPage: React.FC = () => {
  const navigate = useNavigate()

  // step: 1=아이디/이름 입력, 2=이메일 확인+인증
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [verificationMessage, setVerificationMessage] = useState('')
  const sendMut = useSendPwFindCode(email)
  const verifyMut = useVerifyPwFindCode(email, code)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
  } = useForm<FindPwEmailForm>({
    resolver: zodResolver(findPwEmailSchema),
    mode: 'onChange',
  })

  const findEmailMut = useFindRegisteredEmailMutation()

  // 1) 아이디/이름 제출 → 서버에서 등록 이메일 받기
  const onSubmitFindEmail = (form: FindPwEmailForm) => {
    setVerificationMessage('')
    setEmail('')
    findEmailMut.mutate(
      { loginId: form.loginId, name: form.name },
      {
        onSuccess: (registeredEmail) => {
          setEmail(registeredEmail)
          setStep(2)
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.message ||
            err?.response?.data?.errorMessage ||
            '일치하는 정보가 없습니다.'
          alert(`❌ ${msg}`)
        },
      },
    )
  }

  const handleSendCode = () => {
    sendMut.mutate(undefined, {
      onSuccess: () => alert('인증번호가 전송되었습니다. 메일함을 확인해주세요.'),
      onError: (err) => {
        const msg = axios.isAxiosError(err)
          ? (err.response?.data as any)?.message || (err.response?.data as any)?.errorMessage
          : null
        alert(`❌ ${msg || '메일 전송에 실패했어요. 잠시 후 다시 시도해주세요.'}`)
      },
    })
  }

  const handleVerifyCode = () => {
    verifyMut.mutate(undefined, {
      onSuccess: () => {
        alert('✅ 인증번호가 확인되었습니다.')
        const { loginId } = getValues()
        setTimeout(() => navigate('/reset-password', { state: { loginId, email } }), 700)
      },
      onError: (err) => {
        const msg = axios.isAxiosError(err)
          ? (err.response?.data as any)?.message || (err.response?.data as any)?.errorMessage
          : null
        alert(`❌ ${msg || '인증번호 확인에 실패했어요.'}`)
      },
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <img src={Logo} alt="tekcit logo" className={styles.logo} />
        <h2 className={styles.title}>비밀번호 찾기</h2>

        {step === 1 && (
          <form onSubmit={handleSubmit(onSubmitFindEmail)} className={styles.form}>
            <input
              type="text"
              placeholder="아이디"
              {...register('loginId')}
              aria-invalid={!!errors.loginId}
              className={styles.input}
            />
            {errors.loginId && <p className={styles.error}>{errors.loginId.message}</p>}

            <input
              type="text"
              placeholder="이름"
              {...register('name')}
              aria-invalid={!!errors.name}
              className={styles.input}
            />
            {errors.name && <p className={styles.error}>{errors.name.message}</p>}

            <div className={styles.actions}>
              <Button
                type="submit"
                className="w-full h-11"
                disabled={!isValid || findEmailMut.isPending}
              >
                {findEmailMut.isPending ? '조회 중…' : '다음'}
              </Button>
            </div>

            {verificationMessage && <p className={styles.error}>{verificationMessage}</p>}
          </form>
        )}

        {step === 2 && (
          <>
            <div className={styles.emailRow}>
              <input
                type="text"
                value={maskEmail(email)} // 표시만 마스킹
                readOnly
                className={`${styles.input} ${styles.readonly}`}
              />
              <Button
                onClick={handleSendCode}
                disabled={sendMut.isPending}
                className="text-sm w-[120px] h-[50px]"
              >
                {sendMut.isPending ? '전송 중…' : '인증 전송'}
              </Button>
            </div>

            <div className={styles.emailRow}>
              <input
                type="text"
                placeholder="인증번호 입력"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={styles.input}
              />
              <Button
                onClick={handleVerifyCode}
                disabled={!code || verifyMut.isPending}
                className="text-sm w-[120px] h-[50px]"
              >
                {verifyMut.isPending ? '확인 중…' : '인증 확인'}
              </Button>
            </div>

            {verificationMessage && (
              <p className={styles.verificationMessage}>{verificationMessage}</p>
            )}

            <div className={styles.actions}>
              <Button onClick={() => setStep(1)} className="w-full h-11">
                돌아가기
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default FindPasswordPage
