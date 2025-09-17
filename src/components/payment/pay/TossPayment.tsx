import { forwardRef, useImperativeHandle } from 'react'
import PortOne, { Currency, PayMethod } from '@portone/browser-sdk/v2'
import styles from './TossPayment.module.css'
import { paymentRequest } from '@/shared/api/payment/toss'
import { getEnv } from '@/shared/config/env'

export interface TossPaymentProps {
  isOpen: boolean
  onToggle: () => void
  amount: number
  orderName: string
  redirectUrl?: string
  bookingId: string
  festivalId: string
  sellerId: number
}

export type TossPaymentHandle = {
  requestPay: (args: {
    paymentId: string
    amount: number
    orderName: string
    bookingId: string
    festivalId: string
    sellerId: number
    successUrl?: string
    failUrl?: string
  }) => Promise<void>
}

const STORE_ID = getEnv("VITE_PORTONE_STORE_ID")
const CHANNEL_KEY = getEnv("VITE_PORTONE_CHANNEL_KEY")

const TossPayment = forwardRef<TossPaymentHandle, TossPaymentProps>(
  (
    { isOpen, onToggle, amount, orderName, redirectUrl },
    ref,
  ) => {
    useImperativeHandle(ref, () => ({
      async requestPay({ paymentId, amount, orderName, bookingId, festivalId, sellerId, successUrl, failUrl }) {
        const hasSellerId = typeof sellerId === 'number' && Number.isFinite(sellerId) && sellerId >= 0

        if (!STORE_ID || !CHANNEL_KEY) {
          alert('결제 설정이 올바르지 않습니다. 관리자에게 문의하세요.')
          throw new Error('Missing PortOne credentials')
        }

        if (!bookingId || !festivalId || !hasSellerId) {
          alert('결제 정보가 부족합니다. 다시 시도해 주세요.')
          throw new Error('Invalid booking/festival/seller context')
        }

        // ✅ successUrl 사용하고, 없으면 기본값으로 paymentId 포함한 URL 생성
        const finalRedirectUrl = successUrl || `${window.location.origin}/payment/result?type=booking&status=success&paymentId=${encodeURIComponent(paymentId)}`

        await paymentRequest(paymentId, bookingId, festivalId, sellerId, amount)

        await PortOne.requestPayment({
          storeId: STORE_ID,
          channelKey: CHANNEL_KEY,
          paymentId,
          orderName,
          totalAmount: amount,
          currency: Currency.KRW,
          payMethod: PayMethod.CARD,
          redirectUrl: finalRedirectUrl, // ✅ 실제로 전달받은 successUrl 사용
        })
      },
    }))

    return (
      <div className={styles.wrapper}>
        <button type="button" className={styles.header} onClick={onToggle} aria-expanded={isOpen}>
          <span className={styles.title}>토스 페이먼츠</span>
          <span className={styles.sub}>신용/체크카드 / 간편결제</span>
        </button>
      </div>
    )
  },
)

TossPayment.displayName = 'TossPayment'
export default TossPayment