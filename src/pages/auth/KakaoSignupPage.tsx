import React, { useCallback, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import Logo from '@assets/logo.png'
import styles from './SignupPage.module.css'         
import ProgressBar from '@/components/auth/signup/ProgressBar'
import AddressSearchModal from '@/components/auth/signup/AddressSearchModal'

import Step2Form from '@/components/auth/signup/stepform/Step2Form'
import Step3Form from '@/components/auth/signup/stepform/Step3Form'
import KakaoPopupBridge from '@/components/auth/login/KakaoPopupBridge'

import type { Step2, Step3 } from '@/models/auth/schema/signupSchema'
import { useKakaoSignupMutation } from '@/models/auth/tanstack-query/useKakaoSignup'

type KakaoSignupDTO = {
  name: string
  phone: string
  userProfile?: {
    zipcode?: string
    address1?: string
    address2?: string
  }
}

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
  const progress = step === 2 ? 0 : 100                  

  const [showModal, setShowModal] = useState(false)
  const openAddress = useCallback(() => setShowModal(true), [])
  const handleAddressComplete = useCallback(
    (payload: { zipCode: string; address: string }) => {
      setAcc3((s) => ({ ...s, zipCode: payload.zipCode, address: payload.address }))
      setShowModal(false)
    },
    []
  )

  const signupMut = useKakaoSignupMutation()

  const handleStep2Next = useCallback(() => setStep(3), [])
  const goPrevFromStep2 = useCallback(() => navigate('/login'), [navigate])
  const goPrevFromStep3 = useCallback(() => setStep(2), [])

  const handleStep3Next = useCallback(() => {
    const body: KakaoSignupDTO = {
      name: acc2.name ?? '',
      phone: acc2.phone ?? '',
      userProfile: {
        zipcode: acc3.zipCode || undefined,
        address1: acc3.address || undefined,
        address2: acc3.detailAddress || undefined,
      },
    }
    signupMut.mutate(body, {
      onSuccess: () => navigate('/login', { replace: true }),
    })
  }, [acc2, acc3, signupMut, navigate])

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {!!window.opener && <KakaoPopupBridge result="new" />}

        <img src={Logo} alt="tekcit logo" className={styles.logo} />
        <h2 className={styles.title}>회원가입</h2>

        <ProgressBar percent={progress} />

        {step === 2 && (
          <Step2Form
            acc={acc2}
            onPrev={goPrevFromStep2}
            onNext={handleStep2Next}
            updateAcc={(p) => setAcc2((s) => ({ ...s, ...p }))}
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
