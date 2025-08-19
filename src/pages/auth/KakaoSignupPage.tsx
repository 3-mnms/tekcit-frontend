// src/pages/auth/signup/KakaoSignupPage.tsx
import React, { useCallback, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import Logo from '@assets/logo.png'
import styles from './SignupPage.module.css'
import ProgressBar from '@/components/auth/signup/ProgressBar'
import AddressSearchModal from '@/components/auth/signup/AddressSearchModal'

import Step2Form from '@/components/auth/signup/stepform/Step2Form'
import Step3Form from '@/components/auth/signup/stepform/Step3Form'
import KakaoPopupBridge from '@/components/auth/login/KakaoPopupBridge'

import {
  type KakaoStep2 as Step2,
  type KakaoStep3 as Step3,
  buildKakaoSignupDTO,
} from '@/models/auth/schema/kakaoSignupSchema'
import { useKakaoSignupMutation } from '@/models/auth/tanstack-query/useKakaoSignup'

const KakaoSignupPage: React.FC = () => {
  const navigate = useNavigate()
  const { search } = useLocation()

  useEffect(() => {
    const qs = new URLSearchParams(search)
    if (qs.get('provider') !== 'kakao') {
      navigate('/auth/signup', { replace: true })
    }
  }, [search, navigate])

  const [acc2, setAcc2] = useState<Partial<Step2>>({})
  const [acc3, setAcc3] = useState<Partial<Step3>>({})

  const [step, setStep] = useState<2 | 3>(2)
  const progress = step === 2 ? 50 : 100

  const [showModal, setShowModal] = useState(false)
  const openAddress = useCallback(() => setShowModal(true), [])
  const handleAddressComplete = useCallback((payload: { zipCode: string; address: string }) => {
    setAcc3((s) => ({ ...s, zipCode: payload.zipCode, address: payload.address }))
    setShowModal(false)
  }, [])

  const signupMut = useKakaoSignupMutation()

  const handleStep2Next = useCallback(() => setStep(3), [])
  const goPrevFromStep2 = useCallback(() => navigate('/login'), [navigate])
  const goPrevFromStep3 = useCallback(() => setStep(2), [])

  const handleStep3Next = useCallback(() => {
    // 1차 프론트 검증
    const residentNum = `${acc2.rrnFront ?? ''}-${acc2.rrnBackFirst ?? ''}`
    if (!/^\d{6}-[1-4]$/.test(residentNum)) {
      alert('주민번호 형식이 올바르지 않습니다. 예: 990101-1')
      return
    }

    const body = buildKakaoSignupDTO(acc2, acc3)

    signupMut.mutate(body, {
      onSuccess: () => {
        alert('카카오 회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.')
        navigate('/login', { replace: true })
      },
      onError: (err) => {
        alert((err as Error)?.message || '회원가입에 실패했어요.')
      },
    })
  }, [acc2, acc3, signupMut, navigate])

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {!!window.opener && <KakaoPopupBridge status="new" />}

        <img src={Logo} alt="tekcit logo" className={styles.logo} />
        <h2 className={styles.title}>회원가입</h2>

        <ProgressBar percent={progress} />

        {step === 2 && (
          <Step2Form
            acc={acc2}
            onPrev={goPrevFromStep2}
            onNext={handleStep2Next}
            updateAcc={(p) => setAcc2((s) => ({ ...s, ...p }))}
            // Step2Form 내부에서도 kakaoStep2Schema를 사용해 validate 해줘!
          />
        )}

        {step === 3 && (
          <>
            <Step3Form
              acc={acc3}
              onPrev={goPrevFromStep3}
              onNext={handleStep3Next}
              updateAcc={(p) => setAcc3((s) => ({ ...s, ...p }))}
              openAddress={openAddress}
              // Step3Form도 kakaoStep3Schema 사용
            />

            {signupMut.isError && (
              <p className="mt-3 text-sm text-red-600">
                {(signupMut.error as Error)?.message || '회원가입에 실패했어요.'}
              </p>
            )}
            {signupMut.isPending && <p className="mt-2 text-sm">가입 처리 중…</p>}
          </>
        )}

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

export default KakaoSignupPage