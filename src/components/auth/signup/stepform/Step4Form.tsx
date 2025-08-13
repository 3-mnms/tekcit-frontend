// features/auth/signup/components/Step4Form.tsx
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupStep4, type Step4 } from '@/models/auth/schema/signupSchema'
import Button from '@/components/common/button/Button'
import SignupInputField from '@/components/auth/signup/SignupInputFields'
import { FaEnvelope, FaShieldHalved } from 'react-icons/fa6'
import styles from '@/pages/auth/SignupPage.module.css'
import { useCheckEmail, useSendEmailCode, useVerifyEmailCode } from '@/models/auth/tanstack-query/useSignup'

interface Props {
  acc: Partial<Step4>
  onPrev: () => void
  onDone: () => void
  setIsEmailCodeSent: (b: boolean) => void
  isEmailCodeSent: boolean
  updateAcc: (p: Partial<Step4>) => void
}

const CODE_TTL_SEC = 5 * 60 // 5분

const Step4Form: React.FC<Props> = ({
  acc,
  onPrev,
  onDone,
  setIsEmailCodeSent,
  isEmailCodeSent,
  updateAcc,
}) => {
  const { register, handleSubmit, getValues, setValue, formState: { errors } } = useForm<Step4>({
    resolver: zodResolver(signupStep4),
    mode: 'onChange',
    defaultValues: { email: acc.email ?? '', emailCode: acc.emailCode ?? '' },
  })

  const checkEmailMut = useCheckEmail()
  const sendCodeMut = useSendEmailCode()
  const verifyCodeMut = useVerifyEmailCode()

  // ⏱ 인증 코드 남은 시간
  const [codeLeft, setCodeLeft] = useState<number>(0)

  // 카운트다운
  useEffect(() => {
    if (codeLeft <= 0) return
    const t = setInterval(() => setCodeLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [codeLeft])

  const mmss = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = Math.floor(sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const onSendEmailCode = () => {
    const email = getValues('email')
    if (!email) return alert('이메일을 먼저 입력하세요')
    updateAcc({ email })
    setValue('email', email, { shouldValidate: true, shouldDirty: false })

    checkEmailMut.mutate(email, {
      onSuccess: (ok) => {
        if (!ok) return alert('이미 사용 중인 이메일')
        sendCodeMut.mutate(email, {
          onSuccess: () => {
            alert(isEmailCodeSent ? '인증 코드 재전송 완료' : '인증 코드 발송')
            setIsEmailCodeSent(true)
            setCodeLeft(CODE_TTL_SEC) // ⏱ 전송/재전송 시 5분 리셋
          },
          onError: () => alert('발송 실패'),
        })
      },
      onError: () => alert('이메일 중복 확인 실패'),
    })
  }

  const onVerifyEmailCode = () => {
    const email = getValues('email')
    const code = getValues('emailCode')
    if (!email) return alert('이메일을 입력하세요')
    if (!code) return alert('인증 코드를 입력하세요')
    updateAcc({ emailCode: code })
    setValue('emailCode', code, { shouldValidate: true, shouldDirty: false })
    verifyCodeMut.mutate({ email, code }, {
      onSuccess: () => alert('인증 완료'),
      onError: () => alert('인증 실패'),
    })
  }

  const submit = (data: Step4) => {
    updateAcc(data)
    onDone()
  }

  return (
    <form onSubmit={handleSubmit(submit)} className={styles.formContent}>
      {/* 이메일 + (코드 전송/재전송) 버튼 */}
      <SignupInputField
        {...register('email')}
        icon={<FaEnvelope />}
        placeholder="이메일 입력"
        hasButton
        buttonText={
          sendCodeMut.isPending
            ? '전송중...'
            : (isEmailCodeSent ? '재전송' : '코드 전송')
        }
        onButtonClick={onSendEmailCode}
        error={errors.email?.message}
        buttonDisabled={sendCodeMut.isPending}
      />

      {/* 인증 코드 입력 + 타이머 */}
      {isEmailCodeSent && (
        <>
          <SignupInputField
            {...register('emailCode')}
            icon={<FaShieldHalved />}
            placeholder="인증 코드 입력"
            hasButton
            buttonText="인증 확인"
            onButtonClick={onVerifyEmailCode}
            error={errors.emailCode?.message}
          />
          {/* ⏱ 입력 밑에 타이머 텍스트 (검은색) */}
          <div style={{ marginTop: -10, marginLeft: 10, fontSize: 12, color: '#111827' }}>
            인증 코드는 5분 동안 유효합니다.
            {codeLeft > 0 && <> (남은 시간 {mmss(codeLeft)})</>}
            {codeLeft === 0 && isEmailCodeSent && <> (만료됨 · 재전송 후 다시 시도하세요)</>}
          </div>
        </>
      )}

      <div className={styles.navButtons}>
        <Button type="button" onClick={onPrev}>이전</Button>
        <Button type="submit">가입하기</Button>
      </div>
    </form>
  )
}

export default Step4Form
