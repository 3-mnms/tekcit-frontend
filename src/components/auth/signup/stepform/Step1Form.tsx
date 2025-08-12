// features/auth/signup/components/Step1Form.tsx
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupStep1, type Step1 } from '@/models/auth/schema/signupSchema'
import Button from '@/components/common/button/Button'
import SignupInputField from '@/components/auth/signup/SignupInputFields'
import { FaUser, FaLock } from 'react-icons/fa6'
import styles from '@/pages/auth/SignupPage.module.css'
import { useCheckLoginId } from '@/models/auth/tanstack-query/useSignup'

interface Props {
  acc: Partial<Step1>
  onNext: () => void
  updateAcc: (p: Partial<Step1>) => void
}

const Step1Form: React.FC<Props> = ({ acc, onNext, updateAcc }) => {
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, touchedFields },
  } = useForm<Step1>({
    resolver: zodResolver(signupStep1),
    mode: 'onChange',
    defaultValues: { loginId: acc.loginId ?? '', loginPw: acc.loginPw ?? '', passwordConfirm: acc.passwordConfirm ?? '' },
  })

  const checkLoginIdMut = useCheckLoginId()
  const onCheckLoginId = () => {
    const id = getValues('loginId')
    if (!id) return alert('아이디를 먼저 입력하세요')
    updateAcc({ loginId: id })
    setValue('loginId', id, { shouldValidate: true, shouldDirty: false })
    checkLoginIdMut.mutate(id, {
      onSuccess: (ok) => alert(ok ? '사용 가능' : '이미 사용 중'),
      onError: () => alert('아이디 확인 실패'),
    })
  }

  const submit = (data: Step1) => {
    updateAcc(data)
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
export default Step1Form
