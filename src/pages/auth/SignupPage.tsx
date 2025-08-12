// pages/auth/SignupPage.tsx
import React from 'react'
import Logo from '@assets/logo.png'
import styles from './SignupPage.module.css'
import ProgressBar from '@/components/auth/signup/ProgressBar'
import { useSignupWizard } from '@/models/auth/hook/useSignupWizard'
import { useSignupMutation } from '@/models/auth/tanstack-query/useSignup'
import { mapToSignupDto } from '@/models/auth/mapToSignupDto'
import AddressSearchModal from '@/components/auth/signup/AddressSearchModal'
import { useNavigate } from 'react-router-dom'

import Step1Form from '@/components/auth/signup/stepform/Step1Form'
import Step2Form from '@/components/auth/signup/stepform/Step2Form'
import Step3Form from '@/components/auth/signup/stepform/Step3Form'
import Step4Form from '@/components/auth/signup/stepform/Step4Form'

const SignupPage: React.FC = () => {
  const nav = useNavigate()
  const {
    step, progress, showModal, isEmailCodeSent, acc,
    setShowModal, setIsEmailCodeSent, updateAcc, next, prev,
    handleAddressComplete, parseFinal,
  } = useSignupWizard()

  const signupMut = useSignupMutation()

  const handleFinalSubmit = () => {
    const parsed = parseFinal()
    if (!parsed.success) return alert('입력값을 다시 확인해주세요.')
    const dto = mapToSignupDto(parsed.data)
    signupMut.mutate(dto, {
      onSuccess: () => { alert('회원가입 성공! 로그인 페이지로 이동합니다.'); nav('/login') },
      onError: () => alert('회원가입 실패'),
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <img src={Logo} alt="tekcit logo" className={styles.logo} />
        <h2 className={styles.title}>회원가입</h2>

        <ProgressBar percent={progress} />

        {step === 1 && <Step1Form acc={acc} updateAcc={updateAcc} onNext={next} />}
        {step === 2 && <Step2Form acc={acc} updateAcc={updateAcc} onPrev={prev} onNext={next} />}
        {step === 3 && (
          <Step3Form
            acc={acc}
            updateAcc={updateAcc}
            onPrev={prev}
            onNext={next}
            openAddress={() => setShowModal(true)}
          />
        )}
        {step === 4 && (
          <Step4Form
            acc={acc}
            updateAcc={updateAcc}
            onPrev={prev}
            onDone={handleFinalSubmit}
            isEmailCodeSent={isEmailCodeSent}
            setIsEmailCodeSent={setIsEmailCodeSent}
          />
        )}

        {showModal && (
          <AddressSearchModal onClose={() => setShowModal(false)} onComplete={handleAddressComplete} />
        )}
      </div>
    </div>
  )
}

export default SignupPage