import { forwardRef, useImperativeHandle } from 'react'
import PortOne, { Currency, PayMethod } from '@portone/browser-sdk/v2'
import styles from './TossPayment.module.css'
import { requestPayment, type PaymentRequestDTO } from '@/shared/api/payment/payments'
import { getEnv } from '@/shared/config/env'

// DUMMY_USER_ID는 실제 유저 ID로 대체되어야 합니다.
const DUMMY_USER_ID = 1;

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
  }) => Promise<void>
}

const STORE_ID = getEnv("VITE_PORTONE_STORE_ID")
const CHANNEL_KEY = getEnv("VITE_PORTONE_CHANNEL_KEY")

const TossPayment = forwardRef<TossPaymentHandle, TossPaymentProps>(
  (
    { isOpen, onToggle, amount, orderName, redirectUrl, bookingId, festivalId, sellerId },
    ref,
  ) => {
    useImperativeHandle(ref, () => ({
      async requestPay(args) {
        // useImperativeHandle의 인자 타입을 명확히 했으므로 여기서 구조 분해 할당 오류가 사라집니다.
        const { paymentId, amount, orderName, bookingId, festivalId, sellerId } = args;

        const hasSellerId = typeof sellerId === 'number' && Number.isFinite(sellerId) && sellerId >= 0

        if (!STORE_ID || !CHANNEL_KEY) {
          alert('결제 설정이 올바르지 않습니다. 관리자에게 문의하세요.')
          throw new Error('Missing PortOne credentials')
        }

        if (!bookingId || !festivalId || !hasSellerId) {
          alert('결제 정보가 부족합니다. 다시 시도해 주세요.')
          throw new Error('Invalid booking/festival/seller context')
        }

        const finalRedirect = `${window.location.origin}/payment/booking?paymentId=${encodeURIComponent(paymentId)}`;

        // ✅ 불필요한 중복 호출을 제거하고, 올바른 인자를 전달하는 단일 호출로 수정
        const dto: PaymentRequestDTO = {
          paymentId,
          bookingId,
          festivalId,
          paymentRequestType: 'GENERAL_PAYMENT_REQUESTED',
          sellerId,
          amount,
          currency: 'KRW',
          payMethod: 'CARD',
          STORE_KEY: STORE_ID,
          CHANNEL_KEY: CHANNEL_KEY,
        };
        await requestPayment(dto, DUMMY_USER_ID); // 두 번째 인자로 userId 추가

        await PortOne.requestPayment({
          storeId: STORE_ID,
          channelKey: CHANNEL_KEY,
          paymentId,
          orderName,
          totalAmount: amount,
          currency: Currency.KRW,
          payMethod: PayMethod.CARD,
          redirectUrl: finalRedirect,
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