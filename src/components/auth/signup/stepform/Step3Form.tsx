// features/auth/signup/components/Step3Form.tsx
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupStep3, type Step3 } from '@/models/auth/schema/signupSchema'
import Button from '@/components/common/button/Button'
import SignupInputField from '@/components/auth/signup/SignupInputFields'
import { FaHouse, FaLocationDot } from 'react-icons/fa6'
import styles from '@/pages/auth/SignupPage.module.css'

interface Props {
  acc: Partial<Step3>
  onPrev: () => void
  onNext: () => void
  updateAcc: (p: Partial<Step3>) => void
  openAddress: () => void
}

const Step3Form: React.FC<Props> = ({ acc, onPrev, onNext, updateAcc, openAddress }) => {
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
    updateAcc(data)
    onNext()
  }

  const zip = watch('zipCode')
  const handleSkip = () => {
    updateAcc({ zipCode: '', address: '', detailAddress: '' })
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
        onButtonClick={openAddress}
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
        <Button type="button" onClick={onPrev}>이전</Button>
        {zip?.trim() ? (
          <Button type="submit">다음</Button>
        ) : (
          <Button type="button" onClick={handleSkip}>건너뛰기</Button>
        )}
      </div>
    </form>
  )
}

export default Step3Form
