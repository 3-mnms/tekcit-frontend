// src/pages/payment/BookingPaymentPage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import WalletPayment from '@/components/payment/pay/WalletPayment'
import CardSimplePayment from '@/components/payment/pay/CardSimplePayment'
import GeneralCardPayment from '@/components/payment/pay/GeneralCardPayment'
import PaymentInfo from '@/components/payment/pay/PaymentInfo'
import Button from '@/components/common/button/Button'
import PasswordInputModal from '@/pages/payment/modal/PasswordInputModal'

import styles from '@pages/payment/BookingPaymentPage.module.css'

import type { SimpleMethod, PaymentMethod } from '@/shared/types/payment'

const fakePay = async (method: PaymentMethod, simple?: SimpleMethod) => {
  await new Promise((r) => setTimeout(r, 700))
  const ok = Math.random() < 0.8
  const txId = Math.random().toString(36).slice(2, 10)
  return { ok, txId, method, simple }
}

const BookingPaymentPage: React.FC = () => {
  const navigate = useNavigate()

  const [openedMethod, setOpenedMethod] = useState<PaymentMethod | null>(null)
  const [selectedSimple, setSelectedSimple] = useState<SimpleMethod | null>(null)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isPaying, setIsPaying] = useState(false)

  const doRouteByResult = ({
    ok,
    txId,
    method,
    simple,
  }: {
    ok: boolean
    txId?: string
    method: PaymentMethod
    simple?: SimpleMethod | null
  }) => {
    const state = { method, simple, txId }
    if (ok) navigate('/payment/payment-success', { state })
    else navigate('/payment/payment-fail', { state })
  }

  const handlePayment = async () => {
    if (!openedMethod) {
      alert('결제 수단을 선택해 주세요.')
      return
    }
    if (openedMethod === 'wallet') {
      setIsPasswordModalOpen(true)
      return
    }
    if (openedMethod === 'cardSimple' && !selectedSimple) {
      alert('간편결제 수단(네이버페이/카카오페이/토스페이)을 선택해 주세요.')
      return
    }
    try {
      setIsPaying(true)
      const result = await fakePay(openedMethod, selectedSimple ?? undefined)
      doRouteByResult(result)
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <div className={styles['booking-container']}>
      <div className={styles['left-panel']}>
        <section className={styles['section']}>
          <h2 className={styles['section-title']}>결제 수단</h2>
          <div className={styles['payment-method-wrapper']}>
            <WalletPayment
              isOpen={openedMethod === 'wallet'}
              onToggle={() => setOpenedMethod(openedMethod === 'wallet' ? null : 'wallet')}
            />

            <CardSimplePayment
              isOpen={openedMethod === 'cardSimple'}
              onToggle={() => setOpenedMethod(openedMethod === 'cardSimple' ? null : 'cardSimple')}
              onSelect={(m) => {
                setSelectedSimple(m)
                setOpenedMethod('cardSimple')
              }}
            />

            <GeneralCardPayment
              isOpen={openedMethod === 'general'}
              onToggle={() => setOpenedMethod(openedMethod === 'general' ? null : 'general')}
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
            console.log('입력된 비밀번호:', pw)
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
