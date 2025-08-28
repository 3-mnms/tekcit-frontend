// ✅ TossPayment.tsx — forwardRef 정상 동작 + 주석 추가
import { forwardRef, useImperativeHandle } from 'react'
import { useNavigate } from 'react-router-dom'
import PortOne, { Currency, PayMethod } from '@portone/browser-sdk/v2'
import styles from './TossPayment.module.css'
import { paymentRequest } from '@/shared/api/payment/toss'

// ✅ props 타입: UI 표시에 필요한 값 + 페이지에서 내려준 컨텍스트
export interface TossPaymentProps {
  isOpen: boolean
  onToggle: () => void
  amount: number // 최종 결제 금액(표시용)
  orderName: string // 주문명(표시용)
  redirectUrl?: string // 결과 리디렉트 목적지
  bookingId: string // 컨텍스트(사전요청에 사용 가능)
  festivalId: string
  sellerId: number
  userId: number
}

// ✅ 페이지가 사용할 실행 핸들: requestPay만 노출
export type TossPaymentHandle = {
  requestPay: (args: {
    paymentId: string
    amount: number
    orderName: string
    userId: number
    bookingId: string
    festivalId: string
    sellerId: number
  }) => Promise<void>
}

// ✅ 환경변수 (PortOne)
const STORE_ID = import.meta.env.VITE_PORTONE_STORE_ID?.trim()
const CHANNEL_KEY = import.meta.env.VITE_PORTONE_CHANNEL_KEY?.trim()

const TossPayment = forwardRef<TossPaymentHandle, TossPaymentProps>(
  (
    { isOpen, onToggle, amount, orderName, redirectUrl, bookingId, festivalId, sellerId, userId },
    ref,
  ) => {
    const navigate = useNavigate()

    // ✅ 페이지에서 ref로 호출할 requestPay 구현을 노출
    useImperativeHandle(ref, () => ({
      async requestPay({ paymentId, amount, orderName, userId, bookingId, festivalId, sellerId }) {
        // 1) 필수 키 체크
        if (!STORE_ID || !CHANNEL_KEY) {
          alert('결제 설정이 올바르지 않습니다. 관리자에게 문의하세요.')
          throw new Error('Missing PortOne credentials')
        }

        // 2) 리디렉트 URL 구성(paymentId 쿼리 포함)
        const base = redirectUrl ?? `${window.location.origin}/payment/result?type=booking`
        const finalRedirect =
          `${base}${base.includes('?') ? '&' : '?'}paymentId=` + encodeURIComponent(paymentId)

        // 3) 백엔드 사전요청 (구매자/판매자/주문 컨텍스트 저장)
        await paymentRequest(paymentId, bookingId, festivalId, sellerId, amount, userId)

        // 4) PortOne SDK 호출(리디렉트)
        await PortOne.requestPayment({
          storeId: STORE_ID!,
          channelKey: CHANNEL_KEY!,
          paymentId,
          orderName,
          totalAmount: amount,
          currency: Currency.KRW,
          payMethod: PayMethod.CARD,
          redirectUrl: finalRedirect,
        })

        // ✅ 성공 시 PG가 리디렉트하므로 여기선 추가 처리 없음
      },
    })) // ← 🔒 useImperativeHandle 닫기 중요!

    // ✅ forwardRef 콜백은 반드시 JSX(ReactNode)를 반환해야 함
    return (
      <div className={styles.wrapper}>
        {/* UI 헤더(토글만; 결제 버튼은 페이지에만 존재) */}
        <button type="button" className={styles.header} onClick={onToggle} aria-expanded={isOpen}>
          <span className={styles.title}>토스 페이먼츠</span>
          <span className={styles.sub}>신용/체크카드 / 간편결제</span>
        </button>

        <div className={styles.meta}>
          {/* 예: 금액/주문명 표시(UI 편의) */}
          <span className={styles.amount}>{amount.toLocaleString()}원</span>
          <span className={styles.orderName}>{orderName}</span>
        </div>
      </div>
    )
  },
)

TossPayment.displayName = 'TossPayment'
export default TossPayment
