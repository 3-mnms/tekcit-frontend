// src/pages/auth/KakaoSignupPage.tsx
import React, { useCallback, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

// ✅ 올려준 컴포넌트들 재사용
import Step2Form from '@/components/auth/signup/stepform/Step2Form'
import Step3Form from '@/components/auth/signup/stepform/Step3Form'
import KakaoPopupBridge from '@/components/auth/login/KakaoPopupBridge'

// ✅ 타입은 기존 signupSchema의 Step2/Step3를 그대로 씁니다
import type { Step2, Step3 } from '@/models/auth/schema/signupSchema'

// ✅ axios 기반 카카오 가입 뮤테이션 훅 사용
import { useKakaoSignupMutation } from '@/models/auth/tanstack-query/useKakaoSignup'

// 백엔드 스펙과 맞춘 DTO
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

  // 가드: ?provider=kakao 아니면 일반 가입으로
  useEffect(() => {
    const qs = new URLSearchParams(search)
    if (qs.get('provider') !== 'kakao') {
      navigate('/auth/signup', { replace: true })
    }
  }, [search, navigate])

  // 두 스텝 누적 데이터
  const [acc2, setAcc2] = useState<Partial<Step2>>({})
  const [acc3, setAcc3] = useState<Partial<Step3>>({})

  // 스텝 진행
  const [step, setStep] = useState<2 | 3>(2)

  // 주소 검색 모달/다음API 연결용 콜백 (필요 시 구현)
  const openAddress = useCallback(() => {
    // TODO: 다음 주소 API 모달 열기 등 연결
    console.log('openAddress clicked')
  }, [])

  // ✅ 카카오 회원가입 뮤테이션 (axios 인스턴스 사용)
  const signupMut = useKakaoSignupMutation()

  // Step2 → Step3
  const handleStep2Next = useCallback(() => setStep(3), [])

  // 최종 가입
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
      onSuccess: () => {
        // 백엔드가 kakao_signup 쿠키 삭제 Set-Cookie 반환
        navigate('/login', { replace: true })
      },
    })
  }, [acc2, acc3, signupMut, navigate])

  // 네비게이션(이전)
  const goPrevFromStep2 = useCallback(() => {
    // 카카오 플로우 취소 → 로그인으로
    navigate('/login')
  }, [navigate])

  const goPrevFromStep3 = useCallback(() => setStep(2), [])

  return (
    <div className="w-full max-w-xl mx-auto p-4">
      {!!window.opener && <KakaoPopupBridge result="new" />}
      {step === 2 && (
        <>
          <h2 className="text-xl font-bold mb-4">카카오 회원정보 입력</h2>
          <Step2Form
            acc={acc2}
            onPrev={goPrevFromStep2}
            onNext={handleStep2Next}
            updateAcc={(p) => setAcc2((s) => ({ ...s, ...p }))}
          />
        </>
      )}

      {step === 3 && (
        <>
          <h2 className="text-xl font-bold mb-4">추가 프로필 입력</h2>
          <Step3Form
            acc={acc3}
            onPrev={goPrevFromStep3}
            onNext={handleStep3Next}
            updateAcc={(p) => setAcc3((s) => ({ ...s, ...p }))}
            openAddress={openAddress}
          />

          {/* 에러 메시지 */}
          {signupMut.isError && (
            <p className="mt-3 text-sm text-red-600">
              {(signupMut.error as Error)?.message || '회원가입에 실패했어요.'}
            </p>
          )}

          {/* 진행 중 안내 (필요 시 로더로 대체) */}
          {signupMut.isPending && <p className="mt-2 text-sm">가입 처리 중…</p>}
        </>
      )}
    </div>
  )
}

export default KakaoSignupPage
