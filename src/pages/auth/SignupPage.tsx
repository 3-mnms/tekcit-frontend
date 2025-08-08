import React, { useState } from 'react'
import Logo from '@assets/logo.png'
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
import { signupSchema, type SignupForm } from '@/models/auth/signupSchema'
import {
  useSignupMutation,
  useCheckLoginId,
  useSendEmailCode,
  useVerifyEmailCode,
  useCheckEmail,
} from '@/models/auth/useSignup'

const SignupPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      loginId: '',
      password: '',
      passwordConfirm: '',
      name: '',
      phone: '',
      rrnFront: '',
      rrnBackFirst: '',
      zonecode: '',
      address: '',
      detailAddress: '',
      email: '',
      emailCode: '',
    },
  })

  // API 훅들 (페이지는 훅만 사용)
  const signupMut = useSignupMutation()
  const checkLoginIdMut = useCheckLoginId()
  const checkEmailMut = useCheckEmail()
  const sendCodeMut = useSendEmailCode()
  const verifyCodeMut = useVerifyEmailCode()

  const handleAddressComplete = (data: { zonecode: string; address: string }) => {
    setValue('zonecode', data.zonecode, { shouldValidate: true })
    setValue('address', data.address, { shouldValidate: true })
  }

  const onSubmit = (form: SignupForm) => {
    // DTO 변환이 필요하면 여기서 맞춰서 변환
    const dto = {
      loginId: form.loginId,
      password: form.password,
      name: form.name,
      phone: form.phone.replace(/-/g, ''),
      rrnFront: form.rrnFront,
      rrnBackFirst: form.rrnBackFirst,
      zonecode: form.zonecode,
      address: form.address,
      detailAddress: form.detailAddress,
      email: form.email,
    }
    signupMut.mutate(dto, {
      onSuccess: () => alert('회원가입 성공!'),
      onError: (e: unknown) => {
        if (e && typeof e === 'object' && 'response' in e) {
          const err = e as { response?: { data?: { message?: string } } }
          alert(err.response?.data?.message ?? '회원가입 실패')
        } else {
          alert('회원가입 실패')
        }
      },
    })
  }

  const onCheckLoginId = () => {
    const id = getValues('loginId')
    if (!id) return alert('아이디를 먼저 입력하세요')
    checkLoginIdMut.mutate(id, {
      onSuccess: (ok) => alert(ok ? '사용 가능한 아이디입니다' : '이미 사용 중인 아이디입니다'),
      onError: () => alert('아이디 확인 실패'),
    })
  }

  const onSendEmailCode = () => {
    const email = getValues('email')
    if (!email) return alert('이메일을 먼저 입력하세요')
    // 중복 이메일 확인 먼저
    checkEmailMut.mutate(email, {
      onSuccess: (ok) => {
        if (!ok) return alert('이미 사용 중인 이메일입니다')
        sendCodeMut.mutate(email, {
          onSuccess: () => alert('인증 코드 발송! (5분 유효)'),
          onError: () => alert('인증 코드 발송 실패'),
        })
      },
      onError: () => alert('이메일 중복 확인 실패'),
    })
  }

  const onVerifyEmailCode = () => {
    const email = getValues('email')
    const code = getValues('emailCode')
    if (!email || !code) return alert('이메일/코드를 입력하세요')
    verifyCodeMut.mutate(
      { email, code },
      {
        onSuccess: () => alert('이메일 인증 완료!'),
        onError: () => alert('이메일 인증 실패'),
      },
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <img src={Logo} alt="tekcit logo" className={styles.logo} />
        <h2 className={styles.title}>회원가입</h2>

        <SignupInputField
          {...register('loginId')}
          icon={<FaUser />}
          placeholder="아이디"
          hasButton
          buttonText="중복 확인"
          onButtonClick={onCheckLoginId}
          error={errors.loginId?.message}
        />
        <SignupInputField
          {...register('password')}
          icon={<FaLock />}
          placeholder="비밀번호"
          type="password"
          error={errors.password?.message}
        />
        <SignupInputField
          {...register('passwordConfirm')}
          icon={<FaLock />}
          placeholder="비밀번호 확인"
          type="password"
          error={errors.passwordConfirm?.message}
        />
        <SignupInputField
          {...register('name')}
          icon={<FaUser />}
          placeholder="이름"
          error={errors.name?.message}
        />
        <SignupInputField
          {...register('phone')}
          icon={<FaPhone />}
          placeholder="전화번호 (예: 010-1234-5678)"
          error={errors.phone?.message}
        />

        <div className={styles.rrnRow}>
          <SignupInputField
            {...register('rrnFront')}
            icon={<FaIdCard />}
            placeholder="주민번호 앞자리"
            error={errors.rrnFront?.message}
          />
          <span className={styles.hyphen}>-</span>
          <SignupInputField
            {...register('rrnBackFirst')}
            icon={<FaIdCard />}
            placeholder="뒷자리 첫글자"
            type="password"
            error={errors.rrnBackFirst?.message}
          />
        </div>

        <SignupInputField
          {...register('zonecode')}
          icon={<FaLocationDot />}
          placeholder="우편번호"
          hasButton
          buttonText="주소 찾기"
          onButtonClick={() => setShowModal(true)}
          error={errors.zonecode?.message}
        />
        <SignupInputField
          {...register('address')}
          icon={<FaHouse />}
          placeholder="주소"
          error={errors.address?.message}
        />
        <SignupInputField
          {...register('detailAddress')}
          icon={<FaLocationDot />}
          placeholder="상세주소 입력"
          error={errors.detailAddress?.message}
        />

        {showModal && (
          <AddressSearchModal
            onClose={() => setShowModal(false)}
            onComplete={handleAddressComplete}
          />
        )}

        <SignupInputField
          {...register('email')}
          icon={<FaEnvelope />}
          placeholder="이메일 입력"
          hasButton
          buttonText="인증하기"
          onButtonClick={onSendEmailCode}
          error={errors.email?.message}
        />
        <SignupInputField
          {...register('emailCode')}
          icon={<FaShieldHalved />}
          placeholder="인증 코드 입력"
          hasButton
          buttonText="인증 확인"
          onButtonClick={onVerifyEmailCode}
          error={errors.emailCode?.message}
        />

        <Button
          type="submit"
          className="w-full h-12 mt-4"
          disabled={isSubmitting || signupMut.isPending}
          onClick={handleSubmit(onSubmit)}
        >
          {signupMut.isPending ? '가입 중...' : '가입하기'}
        </Button>
      </div>
    </div>
  )
}

export default SignupPage
