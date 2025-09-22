// features/auth/signup/components/Step4Form.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupStep4, type Step4 } from '@/models/auth/schema/signupSchema'
import Button from '@/components/common/button/Button'
import SignupInputField from '@/components/auth/signup/SignupInputFields'
import { FaEnvelope, FaShieldHalved } from 'react-icons/fa6'
import styles from '@/pages/auth/SignupPage.module.css'
import {
  useCheckEmail,
  useSendEmailCode,
  useVerifyEmailCode,
} from '@/models/auth/tanstack-query/useSignup'

interface Props {
  acc: Partial<Step4>
  onPrev: () => void
  onDone: () => void
  setIsEmailCodeSent: (b: boolean) => void
  isEmailCodeSent: boolean
  updateAcc: (p: Partial<Step4>) => void
}

const CODE_TTL_SEC = 5 * 60
const CUSTOM = '__custom__'
const DOMAIN_OPTIONS = [
  'gmail.com',
  'naver.com',
  'daum.net',
  'hanmail.net',
  'nate.com',
  'outlook.com',
  CUSTOM,
]

const Step4Form: React.FC<Props> = ({
  acc,
  onPrev,
  onDone,
  setIsEmailCodeSent,
  isEmailCodeSent,
  updateAcc,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Step4>({
    resolver: zodResolver(signupStep4),
    mode: 'onChange',
    defaultValues: { email: acc.email ?? '', emailCode: acc.emailCode ?? '' },
  })

  const checkEmailMut = useCheckEmail()
  const sendCodeMut = useSendEmailCode()
  const verifyCodeMut = useVerifyEmailCode()

  // 분리 입력 상태
  const [localPart, setLocalPart] = useState<string>(() =>
    acc.email ? acc.email.split('@')[0] : '',
  )
  const [domainSel, setDomainSel] = useState<string>(() => {
    const d = acc.email?.split('@')[1] ?? ''
    return d && DOMAIN_OPTIONS.includes(d) ? d : d ? CUSTOM : ''
  })
  const [customDomain, setCustomDomain] = useState<string>(() => {
    const d = acc.email?.split('@')[1] ?? ''
    return d && !DOMAIN_OPTIONS.includes(d) ? d : ''
  })

  // ✅ 1) 합쳐진 email은 useMemo로 계산
  const email = useMemo(() => {
    const domain = domainSel === CUSTOM ? customDomain.trim() : domainSel
    const local = localPart.trim()
    return local && domain ? `${local}@${domain}` : ''
  }, [localPart, domainSel, customDomain])

  // ✅ 2) 부모 콜백은 ref로 고정 (deps에서 제외)
  const updateAccRef = useRef(updateAcc)
  const setIsEmailCodeSentRef = useRef(setIsEmailCodeSent)
  useEffect(() => {
    updateAccRef.current = updateAcc
  }, [updateAcc])
  useEffect(() => {
    setIsEmailCodeSentRef.current = setIsEmailCodeSent
  }, [setIsEmailCodeSent])

  // ✅ 3) 실제 email이 바뀔 때만 RHF/부모 업데이트
  const prevEmailRef = useRef<string>('')
  useEffect(() => {
    if (prevEmailRef.current === email) return
    prevEmailRef.current = email

    setValue('email', email, { shouldValidate: true, shouldDirty: true })
    updateAccRef.current({ email })
    setIsEmailCodeSentRef.current(false)
  }, [email, setValue])

  // 인증 타이머
  const [codeLeft, setCodeLeft] = useState<number>(0)
  useEffect(() => {
    if (codeLeft <= 0) return
    const t = setInterval(() => setCodeLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [codeLeft])
  const mmss = (sec: number) =>
    `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`

  const isCustom = domainSel === CUSTOM
  const canSend = !!email && !errors.email && !sendCodeMut.isPending

  const onSendEmailCode = () => {
    if (!email) return alert('이메일을 먼저 입력하세요')
    if (errors.email) return alert('올바른 이메일 형식을 입력하세요')

    // RHF에 확정 반영
    setValue('email', email, { shouldValidate: true, shouldDirty: false })
    updateAccRef.current({ email })

    checkEmailMut.mutate(email, {
      onSuccess: (ok) => {
        if (!ok) return alert('이미 사용 중인 이메일입니다.')
        sendCodeMut.mutate(email, {
          onSuccess: () => {
            alert(isEmailCodeSent ? '인증 코드 재전송 완료' : '인증 코드 발송')
            setIsEmailCodeSentRef.current(true)
            setCodeLeft(CODE_TTL_SEC)
          },
          onError: () => alert('발송 실패'),
        })
      },
      onError: () => alert('이메일 중복 확인 실패'),
    })
  }

  const onVerifyEmailCode = (emailCode: string) => {
    if (!email) return alert('이메일을 입력하세요')
    if (!emailCode) return alert('인증 코드를 입력하세요')

    updateAccRef.current({ emailCode })
    verifyCodeMut.mutate(
      { email, code: emailCode },
      {
        onSuccess: () => alert('인증 완료'),
        onError: () => alert('인증 실패'),
      },
    )
  }

  const submit = (data: Step4) => {
    if (!email) return alert('이메일을 입력하세요')
    updateAccRef.current({ email: email, emailCode: data.emailCode })
    onDone()
  }

  const timerRightSlot = (
    <span
      aria-live="polite"
      className={styles.timerBadge} // 밑에서 CSS 추가
      title={codeLeft > 0 ? `남은 시간 ${mmss(codeLeft)}` : '만료됨'}
    >
      {isEmailCodeSent && (codeLeft > 0 ? mmss(codeLeft) : '만료')}
    </span>
  )

  return (
    <form onSubmit={handleSubmit(submit)} className={styles.formContent}>
      <div className={styles.emailRow}>
        <SignupInputField
          icon={<FaEnvelope />}
          placeholder="이메일 입력"
          value={localPart}
          onChange={(e) => setLocalPart(e.currentTarget.value)}
          inline
          touched={!!(localPart || domainSel || customDomain)}
        />

        <span className={styles.emailAt}>@</span>

        {!isCustom ? (
          <select
            className={`${styles.statusSelect} ${styles.emailSelect}`}
            value={domainSel}
            onChange={(e) => {
              const v = e.target.value
              setDomainSel(v)
              if (v !== CUSTOM) setCustomDomain('')
            }}
            aria-label="이메일 도메인 선택"
          >
            <option value="" disabled>
              선택
            </option>
            {DOMAIN_OPTIONS.map((d) =>
              d === CUSTOM ? (
                <option key={d} value={d}>
                  직접 입력
                </option>
              ) : (
                <option key={d} value={d}>
                  {d}
                </option>
              ),
            )}
          </select>
        ) : (
          <input
            className={`${styles.selectBox} ${styles.emailDomainInput}`}
            value={customDomain}
            onChange={(e) => setCustomDomain(e.currentTarget.value)}
            placeholder="example.com"
          />
        )}

        <Button
          type="button"
          onClick={onSendEmailCode}
          disabled={!canSend}
          className="h-[44px] px-4 text-sm whitespace-nowrap"
        >
          {sendCodeMut.isPending ? '전송중 ...' : isEmailCodeSent ? '재전송' : '코드 전송'}
        </Button>
      </div>

      {isEmailCodeSent && (
        <>
          <SignupInputField
            {...register('emailCode')}
            icon={<FaShieldHalved />}
            placeholder="인증 코드 입력"
            hasButton
            buttonText="인증 확인"
            onButtonClick={() =>
              onVerifyEmailCode(
                document.querySelector<HTMLInputElement>('input[name="emailCode"]')?.value ?? '',
              )
            }
            error={errors.emailCode?.message}
            rightSlot={timerRightSlot}
          />

        </>
      )}

      <div className={styles.navButtons}>
        <Button type="button" onClick={onPrev}>
          이전
        </Button>
        <Button type="submit">가입하기</Button>
      </div>
    </form>
  )
}

export default Step4Form
