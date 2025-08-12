// src/pages/payment/BookingPaymentPage.tsx
import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import WalletPayment from '@/components/payment/pay/WalletPayment'
import GeneralCardPayment, { type GeneralCardPaymentHandle } from '@/components/payment/pay/GeneralCardPayment'
import PaymentInfo from '@/components/payment/pay/PaymentInfo'
import Button from '@/components/common/button/Button'
import PasswordInputModal from '@/pages/payment/modal/PasswordInputModal'

import styles from '@pages/payment/BookingPaymentPage.module.css'

import type { SimpleMethod, PaymentMethod } from '@/shared/types/payment'

// 모의 결제(지갑/간편용) 멍
const fakePay = async (method: PaymentMethod, simple?: SimpleMethod) => {
  await new Promise((r) => setTimeout(r, 700))
  const ok = Math.random() < 0.8
  const txId = Math.random().toString(36).slice(2, 10)
  return { ok, txId, method, simple }
}

const BookingPaymentPage: React.FC = () => {
  const navigate = useNavigate()

  const [openedMethod, setOpenedMethod] = useState<PaymentMethod | null>(null)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isPaying, setIsPaying] = useState(false)

  // ✅ 포트원(채널=토스페이먼츠)에 넘길 결제 정보 멍
  const amount = 157000
  const orderName = '예매 결제'

  // ✅ 일반결제 컴포넌트 트리거용 ref 멍
  const generalRef = useRef<GeneralCardPaymentHandle>(null)

  const doRouteByResult = useCallback((
    params: { ok: boolean; txId?: string; method: PaymentMethod; simple?: SimpleMethod | null }
  ) => {
    const { ok, txId, method, simple } = params
    const state = { method, simple, txId }
    if (ok) navigate('/payment/payment-success', { state })
    else navigate('/payment/payment-fail', { state })
  }, [navigate])

  const toggleMethod = useCallback((m: PaymentMethod) => {
    setOpenedMethod((prev) => (prev === m ? null : m))
  }, [])

  const handlePayment = useCallback(async () => {
    if (!openedMethod) {
      alert('결제 수단을 선택해 주세요.')
      return
    }
    if (isPaying) return // 이중 클릭 방지 멍

    // 킷페이(지갑) 멍
    if (openedMethod === 'wallet') {
      setIsPasswordModalOpen(true)
      return
    }

    // ✅ 일반 카드 결제: 컴포넌트 내부에서 PortOne.requestPayment 호출 멍
    if (openedMethod === 'general') {
      setIsPaying(true)
      try {
        await generalRef.current?.requestPay()
        // 리다이렉트 방식이면 이후 라우팅은 리다이렉트 페이지에서 처리 권장 멍
      } catch (e) {
        console.error(e)
        alert('결제 호출 중 오류가 발생했습니다.')
      } finally {
        setIsPaying(false)
      }
    }
  }, [openedMethod, isPaying])

  return (
    <div className={styles['booking-container']}>
      <div className={styles['left-panel']}>
        <section className={styles['section']}>
          <h2 className={styles['section-title']}>결제 수단</h2>
          <div className={styles['payment-method-wrapper']}>
            <WalletPayment
              isOpen={openedMethod === 'wallet'}
              onToggle={() => toggleMethod('wallet')}
            />

            {/* ✅ 일반 결제(포트원/토스 채널) 멍 */}
            <GeneralCardPayment
              ref={generalRef}
              isOpen={openedMethod === 'general'}
              onToggle={() => toggleMethod('general')}
              amount={amount}
              orderName={orderName}
            />
          </div>
        </section>
      </div>

      <div className={styles['right-panel']}>
        <div className={styles['payment-summary-wrapper']}>
          <PaymentInfo />
        </div>
        <div className={styles['pay-button-wrapper']}>
          <Button
            type="button"
            className={styles['pay-button']}
            onClick={handlePayment}
            disabled={isPaying}
          >
            {isPaying ? '결제 중...' : '결제하기'}
          </Button>
        </div>
      </div>

      {isPasswordModalOpen && (
        <PasswordInputModal
          onClose={() => setIsPasswordModalOpen(false)}
          onComplete={async (pw) => {
            // 비밀번호는 서버 검증 연동 시 사용 멍
            console.debug('입력된 비밀번호:', pw)
            setIsPasswordModalOpen(false)
            setIsPaying(true)
            try {
              const result = await fakePay('wallet')
              doRouteByResult(result)
            } finally {
              setIsPaying(false)
            }
          }}
        />
      )}
    </div>
  )
}

export default BookingPaymentPage
