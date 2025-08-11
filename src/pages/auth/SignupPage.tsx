// pages/auth/SignupPage.tsx
import React, { useMemo, useState } from 'react'
import Logo from '@assets/logo.png'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/common/button/Button'
import SignupInputField from '@/components/auth/signup/SignupInputFields'
import {
  FaUser,
  FaLock,
  FaHouse,
  FaLocationDot,
  FaEnvelope,
  FaShieldHalved,
  FaPhone,
  FaIdCard,
} from 'react-icons/fa6'
import styles from './SignupPage.module.css'
import AddressSearchModal from '@/components/auth/signup/AddressSearchModal'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  signupStep1,
  signupStep2,
  signupStep3,
  signupStep4,
  type Step1,
  type Step2,
  type Step3,
  type Step4,
  signupFinalSchema,
} from '@/models/auth/schema/signupSchema'

import {
  useSignupMutation,
  useCheckLoginId,
  useSendEmailCode,
  useVerifyEmailCode,
  useCheckEmail,
} from '@/models/auth/tanstack-query/useSignup'

const TOTAL_STEPS = 4

type FormAccumulator = Partial<Step1 & Step2 & Step3 & Step4>

const SignupPage: React.FC = () => {
  const [step, setStep] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [isEmailCodeSent, setIsEmailCodeSent] = useState(false)
  const [acc, setAcc] = useState<FormAccumulator>({})
  const navigate = useNavigate()

  const signupMut = useSignupMutation()
  const checkLoginIdMut = useCheckLoginId()
  const checkEmailMut = useCheckEmail()
  const sendCodeMut = useSendEmailCode()
  const verifyCodeMut = useVerifyEmailCode()

  // 진행바: 1단계 0% ~ 4단계 100%
  const progress = useMemo(() => ((step - 1) / (TOTAL_STEPS - 1)) * 100, [step])

  const handleAddressComplete = (data: { zipCode: string; address: string }) => {
    setAcc((prev) => ({ ...prev, zipCode: data.zipCode, address: data.address }))
    setShowModal(false)
  }

  // ========== Step1 Form ==========
  const Step1Form: React.FC<{ onNext: () => void }> = ({ onNext }) => {
    const {
      register,
      handleSubmit,
      getValues,
      setValue,
      formState: { errors, touchedFields },
    } = useForm<Step1>({
      resolver: zodResolver(signupStep1),
      mode: 'onChange',
      reValidateMode: 'onChange',
      defaultValues: {
        loginId: acc.loginId ?? '',
        loginPw: acc.loginPw ?? '',
        passwordConfirm: '',
      },
      shouldUnregister: false,
    })

    const onCheckLoginId = () => {
      const id = getValues('loginId')
      if (!id) return alert('아이디를 먼저 입력하세요')
      setAcc((p) => ({ ...p, loginId: id }))
      setValue('loginId', id, { shouldValidate: true, shouldDirty: false })

      checkLoginIdMut.mutate(id, {
        onSuccess: (ok) => alert(ok ? '사용 가능' : '이미 사용 중'),
        onError: () => alert('아이디 확인 실패'),
      })
    }

    const submit = (data: Step1) => {
      setAcc((p) => ({ ...p, ...data }))
      onNext()
    }

    return (
      <form onSubmit={handleSubmit(submit)} className={styles.formContent}>
        <SignupInputField
          {...register('loginId')}
          icon={<FaUser />}
          placeholder="아이디"
          hasButton
          buttonText="중복 확인"
          onButtonClick={onCheckLoginId}
          error={errors.loginId?.message}
          touched={!!touchedFields.loginId}
        />
        <SignupInputField
          {...register('loginPw')}
          icon={<FaLock />}
          placeholder="비밀번호"
          type="password"
          error={errors.loginPw?.message}
          touched={!!touchedFields.loginPw}
        />
        <SignupInputField
          {...register('passwordConfirm')}
          icon={<FaLock />}
          placeholder="비밀번호 확인"
          type="password"
          error={errors.passwordConfirm?.message}
          touched={!!(touchedFields.passwordConfirm || touchedFields.loginPw)}
        />

        <div className={styles.navButtons}>
          <span />
          <Button type="submit">다음</Button>
        </div>
      </form>
    )
  }

  // ========== Step2 Form ==========
  const Step2Form: React.FC<{ onPrev: () => void; onNext: () => void }> = ({ onPrev, onNext }) => {
    const {
      register,
      handleSubmit,
      setValue,
      formState: { errors, touchedFields },
    } = useForm<Step2>({
      resolver: zodResolver(signupStep2),
      mode: 'onChange',
      reValidateMode: 'onChange',
      defaultValues: {
        name: acc.name ?? '',
        phone: acc.phone ?? '',
        rrnFront: acc.rrnFront ?? '',
        rrnBackFirst: acc.rrnBackFirst ?? '',
      },
    })

    const submit = (data: Step2) => {
      setAcc((p) => ({ ...p, ...data }))
      onNext()
    }

    return (
      <form onSubmit={handleSubmit(submit)} className={styles.formContent}>
        <SignupInputField
          {...register('name')}
          icon={<FaUser />}
          placeholder="이름"
          error={errors.name?.message}
        />
        <SignupInputField
          {...register('phone', {
            onChange: (e) => {
              const value = e.target.value.replace(/[^0-9-]/g, '')
              setValue('phone', value, { shouldValidate: true })
            },
          })}
          icon={<FaPhone />}
          placeholder="전화번호 (예: 010-0000-0000)"
          error={errors.phone?.message}
          touched={!!touchedFields.phone}
        />

        <div className={styles.rrnRow}>
          <SignupInputField
            {...register('rrnFront', {
              onChange: (e) => {
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                setValue('rrnFront', value, { shouldValidate: true })
              },
            })}
            icon={<FaIdCard />}
            placeholder="주민번호 앞자리 (예: 820701)"
            error={errors.rrnFront?.message}
            touched={!!touchedFields.rrnFront}
          />
          <span className={styles.hyphen}>-</span>
          <input
            {...register('rrnBackFirst', {
              onChange: (e) => {
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 1)
                setValue('rrnBackFirst', value, { shouldValidate: true })
              },
            })}
            type="text"
            maxLength={1}
            className={styles.rrnOneDigit}
          />
          <span className={styles.dots}>●●●●●●</span>
          {errors.rrnBackFirst?.message && (
            <p className={styles.errorMsg}>{errors.rrnBackFirst.message}</p>
          )}
        </div>

        <div className={styles.navButtons}>
          <Button type="button" onClick={onPrev}>
            이전
          </Button>
          <Button type="submit">다음</Button>
        </div>
      </form>
    )
  }

  // ========== Step3 Form ==========
  const Step3Form: React.FC<{ onPrev: () => void; onNext: () => void }> = ({ onPrev, onNext }) => {
    const {
      register,
      handleSubmit,
      watch,
      formState: { errors },
    } = useForm<Step3>({
      resolver: zodResolver(signupStep3),
      mode: 'onChange',
      reValidateMode: 'onChange',
      defaultValues: {
        zipCode: acc.zipCode ?? '',
        address: acc.address ?? '',
        detailAddress: acc.detailAddress ?? '',
      },
    })

    const submit = (data: Step3) => {
      setAcc((p) => ({ ...p, ...data }))
      onNext()
    }

    // ✅ 우편번호가 비어 있으면 '건너뛰기' 노출/동작
    const zip = watch('zipCode')
    const handleSkip = () => {
      setAcc((p) => ({ ...p, zipCode: '', address: '', detailAddress: '' }))
      onNext()
    }

    return (
      <form onSubmit={handleSubmit(submit)} className={styles.formContent}>
        <SignupInputField
          {...register('zipCode')}
          icon={<FaLocationDot />}
          placeholder="우편번호"
          readOnly
          hasButton
          buttonText="주소 찾기"
          onButtonClick={() => setShowModal(true)}
          error={errors.zipCode?.message}
        />
        <SignupInputField
          {...register('address')}
          icon={<FaHouse />}
          placeholder="주소"
          readOnly
          error={errors.address?.message}
        />
        <SignupInputField
          {...register('detailAddress')}
          icon={<FaLocationDot />}
          placeholder="상세주소 입력"
          error={errors.detailAddress?.message}
        />

        <div className={styles.navButtons}>
          <Button type="button" onClick={onPrev}>
            이전
          </Button>

          {/* zip이 비었으면 검증 없이 건너뛰기, 값이 있으면 검증하고 다음 */}
          {zip?.trim() ? (
            <Button type="submit">다음</Button>
          ) : (
            <Button type="button" onClick={handleSkip}>
              건너뛰기
            </Button>
          )}
        </div>
      </form>
    )
  }

  // ========== Step4 Form ==========
  const Step4Form: React.FC<{ onPrev: () => void; onDone: () => void }> = ({ onPrev, onDone }) => {
    const {
      register,
      handleSubmit,
      getValues,
      setValue,
      formState: { errors },
    } = useForm<Step4>({
      resolver: zodResolver(signupStep4),
      mode: 'onChange',
      reValidateMode: 'onChange',
      defaultValues: {
        email: acc.email ?? '',
        emailCode: acc.emailCode ?? '',
      },
      shouldUnregister: false,
    })

    const onSendEmailCode = () => {
      const email = getValues('email')
      if (!email) return alert('이메일을 먼저 입력하세요')
      setAcc((p) => ({ ...p, email }))
      setValue('email', email, { shouldValidate: true, shouldDirty: false })

      checkEmailMut.mutate(email, {
        onSuccess: (ok) => {
          if (!ok) return alert('이미 사용 중인 이메일')
          sendCodeMut.mutate(email, {
            onSuccess: () => {
              alert('인증 코드 발송')
              setIsEmailCodeSent(true)
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

      // ✅ 메시지를 분리해서 어떤 값이 비었는지 명확히
      if (!email) return alert('이메일을 입력하세요')
      if (!code) return alert('인증 코드를 입력하세요')

      setAcc((p) => ({ ...p, emailCode: code }))
      setValue('emailCode', code, { shouldValidate: true, shouldDirty: false })

      verifyCodeMut.mutate(
        { email, code },
        {
          onSuccess: () => alert('인증 완료'),
          onError: () => alert('인증 실패'),
        },
      )
    }
    const submit = (data: Step4) => {
      setAcc((p) => ({ ...p, ...data }))
      onDone()
    }

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
          <Button type="button" onClick={onPrev}>
            이전
          </Button>
          <Button type="submit">{signupMut.isPending ? '가입 중...' : '가입하기'}</Button>
        </div>
      </form>
    )
  }

  const handleFinalSubmit = () => {
    const parsed = signupFinalSchema.safeParse(acc)
    if (!parsed.success) {
      alert('입력값을 다시 확인해주세요.')
      return
    }

    const form = parsed.data
    const dto = {
      loginId: form.loginId!,
      loginPw: form.loginPw!,
      name: form.name!,
      phone: form.phone!,
      email: form.email!,
      userProfile: {
        residentNum: `${form.rrnFront!}-${form.rrnBackFirst!}`,
        address: `${form.address ?? ''} ${form.detailAddress ?? ''}`.trim(),
        zipCode: form.zipCode ?? '',
      },
    }

    signupMut.mutate(dto, {
      onSuccess: () => {
        alert('회원가입 성공! 로그인 페이지로 이동합니다.')
        navigate('/login')
      },
      onError: () => alert('회원가입 실패'),
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <img src={Logo} alt="tekcit logo" className={styles.logo} />
        <h2 className={styles.title}>회원가입</h2>

        {/* 진행바: 1단계 0% → 4단계 100% */}
        <div className={styles.progressWrapper}>
          <div className={styles.progress} style={{ width: `${progress}%` }} />
        </div>

        {step === 1 && <Step1Form onNext={() => setStep(2)} />}
        {step === 2 && <Step2Form onPrev={() => setStep(1)} onNext={() => setStep(3)} />}
        {step === 3 && <Step3Form onPrev={() => setStep(2)} onNext={() => setStep(4)} />}
        {step === 4 && <Step4Form onPrev={() => setStep(3)} onDone={handleFinalSubmit} />}

        {showModal && (
          <AddressSearchModal
            onClose={() => setShowModal(false)}
            onComplete={handleAddressComplete}
          />
        )}
      </div>
    </div>
  )
}

export default SignupPage
