// src/pages/payment/BookingPaymentPage.tsx
import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import WalletPayment from '@/components/payment/pay/WalletPayment'
import TossPayment, { type TossPaymentHandle } from '@/components/payment/pay/TossPayment'
import PaymentInfo from '@/components/payment/pay/PaymentInfo'
import Button from '@/components/common/button/Button'
import PasswordInputModal from '@/pages/payment/modal/PasswordInputModal'

import styles from '@pages/payment/BookingPaymentPage.module.css'

type PaymentMethod = 'wallet' | 'Toss'

const fakePay = async (method: PaymentMethod) => {
  await new Promise((r) => setTimeout(r, 700))
  const ok = Math.random() < 0.8
  const txId = Math.random().toString(36).slice(2, 10)
  return { ok, txId, method }
}

const BookingPaymentPage: React.FC = () => {
  const navigate = useNavigate()
  const [openedMethod, setOpenedMethod] = useState<PaymentMethod | null>(null)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isPaying, setIsPaying] = useState(false)

  const amount = 157000
  const orderName = '예매 결제'
  const tossRef = useRef<TossPaymentHandle>(null)

  // ✅ 공통 결과 페이지로 이동하는 헬퍼 멍
  const routeToResult = useCallback(
    (ok: boolean, extra?: Record<string, string | undefined>) => {
      const params = new URLSearchParams({
        type: 'booking',                           // 이 페이지는 예매 결제 멍
        status: ok ? 'success' : 'fail',
        ...(extra ?? {}),
      })
      navigate(`/payment/result?${params.toString()}`)
    },
    [navigate],
  )

  const toggleMethod = useCallback((m: PaymentMethod) => {
    setOpenedMethod((prev) => (prev === m ? null : m))
  }, [])

  const handlePayment = useCallback(async () => {
    if (!openedMethod) {
      alert('결제 수단을 선택해 주세요.')
      return
    }
    if (isPaying) return

    if (openedMethod === 'wallet') {
      setIsPasswordModalOpen(true)
      return
    }

    if (openedMethod === 'Toss') {
      setIsPaying(true)
      try {
        await tossRef.current?.requestPay()       // 리다이렉트 방식으로 ResultPage로 복귀 멍
      } catch (e) {
        console.error(e)
        routeToResult(false)                      // 호출 자체 실패 시 실패로 분기 멍
      } finally {
        setIsPaying(false)
      }
    }
  }, [openedMethod, isPaying, routeToResult])

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

            {/* ✅ 토스 결제는 결과 페이지로 리다이렉트 멍 */}
            <TossPayment
              ref={tossRef}
              isOpen={openedMethod === 'Toss'}
              onToggle={() => toggleMethod('Toss')}
              amount={amount}
              orderName={orderName}
              redirectUrl={`${window.location.origin}/payment/result?type=booking`} // ← 베이스만
            />
          </div>
        </section>
      </div>

      <div className={styles['right-panel']}>
        <div className={styles['payment-summary-wrapper']}><PaymentInfo /></div>
        <div className={styles['pay-button-wrapper']}>
          <Button type="button" className={styles['pay-button']} onClick={handlePayment} disabled={isPaying}>
            {isPaying ? '결제 중...' : '결제하기'}
          </Button>
        </div>
      </div>

      {isPasswordModalOpen && (
        <PasswordInputModal
          onClose={() => setIsPasswordModalOpen(false)}
          onComplete={async (pw) => {
            console.debug('입력된 비밀번호:', pw)
            setIsPasswordModalOpen(false)
            setIsPaying(true)
            try {
              const r = await fakePay('wallet')
              routeToResult(r.ok, { txId: r.txId }) // ✅ 지갑은 바로 ResultPage로 분기 멍
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
