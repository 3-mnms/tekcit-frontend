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

          {/* dots를 같은 그룹 안으로 이동 */}
          <span className={styles.dots}>●●●●●●</span>

          {/* 에러가 두 칸 전체 너비로 깔림 */}
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
