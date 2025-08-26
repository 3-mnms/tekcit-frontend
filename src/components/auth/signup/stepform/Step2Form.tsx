// features/auth/signup/components/Step2Form.tsx
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupStep2, type Step2 } from '@/models/auth/schema/signupSchema'
import Button from '@/components/common/button/Button'
import SignupInputField from '@/components/auth/signup/SignupInputFields'
import { FaUser, FaPhone, FaIdCard } from 'react-icons/fa6'
import styles from '@/pages/auth/SignupPage.module.css'

interface Props {
  acc: Partial<Step2>
  onPrev: () => void
  onNext: () => void
  updateAcc: (p: Partial<Step2>) => void
}

const Step2Form: React.FC<Props> = ({ acc, onPrev, onNext, updateAcc }) => {
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
    updateAcc(data)
    onNext()
  }

  // 컴포넌트 상단 내부에 헬퍼 추가해도 되고, 파일 밖 util로 빼도 돼요.
  const autoHyphen344 = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11) // 010 + 8자리 = 11
    if (digits.length <= 3) return digits
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
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
            const formatted = autoHyphen344(e.target.value)
            setValue('phone', formatted, { shouldValidate: true, shouldDirty: true })
          },
        })}
        icon={<FaPhone />}
        placeholder="전화번호 (숫자만 입력)"
        inputMode="numeric" 
        maxLength={13} 
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
          placeholder="주민등록번호 앞 7자리"
          error={errors.rrnFront?.message}
          touched={!!touchedFields.rrnFront}
        />

        <span className={styles.hyphen}>-</span>

        <div className={styles.rrnBackGroup}>
          <input
            {...register('rrnBackFirst', {
              onChange: (e) => {
                const value = e.target.value.replace(/[^1-4]/g, '').slice(0, 1)
                setValue('rrnBackFirst', value, { shouldValidate: true })
              },
            })}
            type="text"
            maxLength={1}
            className={`${styles.rrnOneDigit} ${
              touchedFields.rrnBackFirst
                ? errors.rrnBackFirst
                  ? styles.inputInvalid
                  : styles.inputValid
                : ''
            }`}
            aria-invalid={!!errors.rrnBackFirst}
            aria-describedby={errors.rrnBackFirst ? 'rrnBackFirst-error' : undefined}
          />

          <span className={styles.dots}>●●●●●●</span>

          {errors.rrnBackFirst?.message && (
            <p id="rrnBackFirst-error" className={styles.rrnBackError}>
              {errors.rrnBackFirst.message}
            </p>
          )}
        </div>
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

export default Step2Form
