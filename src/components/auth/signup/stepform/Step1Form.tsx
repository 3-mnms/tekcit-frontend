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
  const [idChecked, setIdChecked] = useState(false)

  const loginId = watch('loginId') ?? ''
  const loginPw = watch('loginPw') ?? ''
  const loginIdReg = register('loginId')
  const loginPwReg = register('loginPw')
  const passwordConfirmReg = register('passwordConfirm')

  useEffect(() => {
    setIdChecked(false)
  }, [loginId])

  const idCheckDone = idChecked && !errors.loginId && loginId.trim().length >= 4

  const disableIdCheck =
    !loginId.trim() || !!errors.loginId || checkLoginIdMut.isPending || idCheckDone

  const onCheckLoginId = async () => {
    if (idCheckDone) return
    const ok = await trigger('loginId')
    if (!ok) return
    const id = getValues('loginId').trim()
    updateAcc({ loginId: id })
    checkLoginIdMut.mutate(id, {
      onSuccess: (ok) => {
        if (ok) {
          alert('사용 가능한 아이디입니다.')
          setIdChecked(true)
        } else {
          alert('이미 사용 중인 아이디입니다.')
          setIdChecked(false)
        }
      },
      onError: () => {
        alert('아이디 확인 실패')
        setIdChecked(false)
      },
    })
  }

  useEffect(() => {
    if (getFieldState('passwordConfirm').isTouched) {
      void trigger('passwordConfirm')
    }
  }, [loginPw, trigger, getFieldState])

  const submit = (data: Step1) => {
    if (!idCheckDone) {
      alert('아이디 중복 확인을 해주세요.')
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
          setValue('loginId', v, { shouldDirty: true, shouldValidate: true, shouldTouch: true })
          updateAcc({ loginId: v })
        }}
        icon={<FaUser />}
        placeholder="아이디"
        hasButton
        buttonText={
          checkLoginIdMut.isPending ? '확인 중...' : idCheckDone ? '확인 완료' : '중복 확인'
        }
        onButtonClick={onCheckLoginId}
        buttonDisabled={disableIdCheck}
        error={errors.loginId?.message}
        touched={!!touchedFields.loginId}
      />

      {idCheckDone && (
        <p className={styles.successMsg} role="status" aria-live="polite">
          ✓ 사용 가능한 아이디입니다.
        </p>
      )}

      <SignupInputField
        {...loginPwReg}
        onChange={(e) => {
          loginPwReg.onChange(e)
          const v = (e.target as HTMLInputElement).value
          setValue('loginPw', v, { shouldDirty: true, shouldValidate: true, shouldTouch: true }) // ✅ 입력 즉시 검증
          updateAcc({ loginPw: v })
        }}
        icon={<FaLock />}
        placeholder="비밀번호"
        type="password"
        error={errors.loginPw?.message}
        touched={!!touchedFields.loginPw}
      />

      <SignupInputField
        {...passwordConfirmReg}
        onChange={(e) => {
          passwordConfirmReg.onChange(e)
          const v = (e.target as HTMLInputElement).value
          setValue('passwordConfirm', v, {
            shouldDirty: true,
            shouldValidate: true,
            shouldTouch: true,
          }) 
          updateAcc({ passwordConfirm: v })
        }}
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
