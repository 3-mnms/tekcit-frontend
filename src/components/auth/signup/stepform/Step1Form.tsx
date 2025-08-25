// features/auth/signup/components/Step1Form.tsx
import React, { useState, useEffect } from 'react'
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
    watch,
    trigger,
    getFieldState,
    formState: { errors, touchedFields },
  } = useForm<Step1>({
    resolver: zodResolver(signupStep1),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      loginId: acc.loginId ?? '',
      loginPw: acc.loginPw ?? '',
      passwordConfirm: acc.passwordConfirm ?? '',
    },
  })

  const checkLoginIdMut = useCheckLoginId()
  const [idChecked, setIdChecked] = useState(false)  // ✅ 중복확인 여부 저장

  const loginId = watch('loginId') ?? ''
  const loginIdReg = register('loginId')

  // 아이디 변경 시에는 다시 중복확인 필요 → 플래그 리셋
  useEffect(() => {
    setIdChecked(false)
  }, [loginId])

  const disableIdCheck = !loginId.trim() || !!errors.loginId || checkLoginIdMut.isPending

  const onCheckLoginId = async () => {
    const ok = await trigger('loginId')
    if (!ok) return
    const id = getValues('loginId').trim()
    updateAcc({ loginId: id })
    checkLoginIdMut.mutate(id, {
      onSuccess: (ok) => {
        if (ok) {
          alert('사용 가능')
          setIdChecked(true) // ✅ 성공 시 플래그 true
        } else {
          alert('이미 사용 중')
          setIdChecked(false)
        }
      },
      onError: () => {
        alert('아이디 확인 실패')
        setIdChecked(false)
      },
    })
  }

  const submit = (data: Step1) => {
    if (!idChecked) {
      alert('아이디 중복 확인을 해주세요!')
      return
    }
    updateAcc(data)
    onNext()
  }

  return (
    <form onSubmit={handleSubmit(submit)} className={styles.formContent}>
      <SignupInputField
        {...loginIdReg}
        onChange={(e) => {
          loginIdReg.onChange(e)
          const v = (e.target as HTMLInputElement).value
          setValue('loginId', v, {
            shouldDirty: true,
            shouldValidate: true,
            shouldTouch: true,
          })
          updateAcc({ loginId: v })
        }}
        icon={<FaUser />}
        placeholder="아이디"
        hasButton
        buttonText="중복 확인"
        onButtonClick={onCheckLoginId}
        buttonDisabled={disableIdCheck}
        error={errors.loginId?.message}
        touched={getFieldState('loginId').isTouched}
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
        touched={!!touchedFields.passwordConfirm}
      />

      <div className={styles.navButtons}>
        <span />
        <Button type="submit">다음</Button>
      </div>
    </form>
  )
}

export default Step1Form
