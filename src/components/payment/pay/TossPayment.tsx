import { forwardRef, useImperativeHandle } from 'react'
import { useNavigate } from 'react-router-dom'

import PortOne, { Currency, PayMethod } from '@portone/browser-sdk/v2'
import styles from './TossPayment.module.css'
import { paymentRequest } from '@/shared/api/payment/toss'

export interface TossPaymentProps {
  isOpen: boolean
  onToggle: () => void
  amount: number // 실제 최종 결제 금액
  orderName: string
  redirectUrl?: string
}

export type TossPaymentHandle = {
  requestPay: (args: {
    paymentId: string
    amount: number // 최종 결제 금액
    orderName: string
    userId: number      // X-User-Id 헤더로 전달될 값 
    bookingId: string
    festivalId: string
    sellerId: number    // 결제 백엔드 DTO NotNull임
  }) => Promise<void>
}

// 포트원 키
const STORE_ID = import.meta.env.VITE_PORTONE_STORE_ID?.trim()
const CHANNEL_KEY = import.meta.env.VITE_PORTONE_CHANNEL_KEY?.trim()

const TossPayment = forwardRef<TossPaymentHandle, TossPaymentProps>(
  ({ isOpen, onToggle, amount: defaultAmount, orderName: defaultOrderName, redirectUrl }, ref) => {
    const navigate = useNavigate()

    useImperativeHandle(ref, () => ({


      async requestPay({ paymentId, amount, orderName, userId, bookingId, festivalId, sellerId }) {

        if (!STORE_ID || !CHANNEL_KEY) {
          alert('결제 설정이 완료되지 않았습니다. 관리자에게 문의하세요.')
          throw new Error('Missing PortOne credentials')
        }

        const base = redirectUrl ?? `${window.location.origin}/payment/result?type=booking`
        const finalRedirect = `${base}${base.includes('?') ? '&' : '?'}paymentId=${encodeURIComponent(paymentId)}`

        try {
          await paymentRequest(paymentId, bookingId, festivalId, sellerId, amount, userId)
        } catch (e) {
          console.error('[TossPayment] paymentRequest 실패:', e)
          alert('결제 요청 준비에 실패했어요.')
          return
        }

        const sdkResult: unknown = await PortOne.requestPayment({
          storeId: STORE_ID!,             
          channelKey: CHANNEL_KEY!,        
          paymentId,                       
          orderName: orderName || defaultOrderName,
          totalAmount: amount ?? defaultAmount, 
          currency: Currency.KRW,
          payMethod: PayMethod.CARD,
          redirectUrl: finalRedirect,      
        })

        if (!sdkResult) {
          navigate(`/payment/result?type=booking&status=fail`, { replace: true })
          return
        }
      },
    }))

    return (
      <div className={styles.wrapper}>
        <button type="button" className={styles.header} onClick={onToggle} aria-expanded={isOpen}>
          <span className={styles.radio + (isOpen ? ` ${styles.radioOn}` : '')} />
          <div className={styles.info}>
            <span className={styles.title}>토스 페이먼츠</span>
            <span className={styles.sub}>신용/체크카드 / 간편결제</span>
          </div>
        </button>
      </div>
    )
  },
)

TossPayment.displayName = 'TossPayment'
export default TossPayment
