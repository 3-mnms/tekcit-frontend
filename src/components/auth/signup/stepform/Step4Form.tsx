// features/auth/signup/components/Step4Form.tsx
import React from 'react'
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

const Step4Form: React.FC<Props> = ({ acc, onPrev, onDone, setIsEmailCodeSent, isEmailCodeSent, updateAcc }) => {
  const { register, handleSubmit, getValues, setValue, formState: { errors } } = useForm<Step4>({
    resolver: zodResolver(signupStep4),
    mode: 'onChange',
    defaultValues: { email: acc.email ?? '', emailCode: acc.emailCode ?? '' },
  })

  const checkEmailMut = useCheckEmail()
  const sendCodeMut = useSendEmailCode()
  const verifyCodeMut = useVerifyEmailCode()

  const onSendEmailCode = () => {
    const email = getValues('email')
    if (!email) return alert('이메일을 먼저 입력하세요')
    updateAcc({ email })
    setValue('email', email, { shouldValidate: true, shouldDirty: false })
    checkEmailMut.mutate(email, {
      onSuccess: (ok) => {
        if (!ok) return alert('이미 사용 중인 이메일')
        sendCodeMut.mutate(email, {
          onSuccess: () => { alert('인증 코드 발송'); setIsEmailCodeSent(true) },
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

  const submit = (data: Step4) => { updateAcc(data); onDone() }

  return (
    <form onSubmit={handleSubmit(submit)} className={styles.formContent}>
      <SignupInputField
        {...register('email')}
        icon={<FaEnvelope />}
        placeholder="이메일 입력"
        hasButton
        buttonText={sendCodeMut.isPending ? '전송중...' : '코드 전송'}
        onButtonClick={onSendEmailCode}
        error={errors.email?.message}
        buttonDisabled={sendCodeMut.isPending}
      />
      {isEmailCodeSent && (
        <SignupInputField
          {...register('emailCode')}
          icon={<FaShieldHalved />}
          placeholder="인증 코드 입력"
          hasButton
          buttonText="인증 확인"
          onButtonClick={onVerifyEmailCode}
          error={errors.emailCode?.message}
        />
      )}
      <div className={styles.navButtons}>
        <Button type="button" onClick={onPrev}>이전</Button>
        <Button type="submit">가입하기</Button>
      </div>
    </form>
  )
}
export default Step4Form