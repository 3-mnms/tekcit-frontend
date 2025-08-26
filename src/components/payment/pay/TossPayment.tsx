import { forwardRef, useImperativeHandle } from 'react'
import PortOne, { Currency, PayMethod } from '@portone/browser-sdk/v2'
import styles from './TossPayment.module.css'
import { paymentRequest } from '@/shared/api/payment/toss'

import { api } from '@/shared/config/axios'
import { useNavigate } from 'react-router-dom'
export interface TossPaymentProps {
  isOpen: boolean
  onToggle: () => void
  amount: number
  orderName: string
  redirectUrl?: string
}

export type TossPaymentHandle = {
  requestPay: (args: {
    paymentId: string
    amount: number
    orderName: string
    userId: number      // ✅ X-User-Id 헤더용 
    bookingId: string   // 백엔드 넘겨줘야 함
    festivalId: string  // 백엔드 넘겨줘야 함
    sellerId: number    // ✅ 백엔드 DTO 필수 
  }) => Promise<void>
}

const STORE_ID = import.meta.env.VITE_PORTONE_STORE_ID?.trim()
const CHANNEL_KEY = import.meta.env.VITE_PORTONE_CHANNEL_KEY?.trim()

const TossPayment = forwardRef<TossPaymentHandle, TossPaymentProps>(
  ({ isOpen, onToggle, amount: defaultAmount, orderName: defaultOrderName, redirectUrl }, ref) => {
    const navigate = useNavigate();
    const paymentConfirm = async (paymentId: string) => {
      const MAX_TRIES = 3

      console.log("payment confirm action");

      for (let tryCount = 0; tryCount < MAX_TRIES; tryCount++) {
        await new Promise((r) => setTimeout(r, (tryCount + 1) * 2000))

        try {
          const completeResponse = await api.post(`/payments/complete/${paymentId}`)

          console.log(`paymentConfirm 시도 ${tryCount + 1}:`, completeResponse);
          const isSuccess = completeResponse.data.success;
          if (isSuccess) {
            // 성공 응답 처리
            return true;
          }
        } catch {
          return false;
        }

        if (tryCount === MAX_TRIES - 1) {
          console.error('결제 실패');
          return false;
          // 실패 처리
        }
      }
    }

    useImperativeHandle(ref, () => ({

      // ✅ 결제 트리거 멍(결과 페이지에서 상태 확정)
      async requestPay({ paymentId, amount, orderName, userId, bookingId, festivalId, sellerId }) {

        // 1) 결과 페이지 리다이렉트 URL 구성 (여기서는 paymentId만 넘김)
        const base = redirectUrl ?? `${window.location.origin}/payment/result?type=booking`
        const finalRedirect = `${base}${base.includes('?') ? '&' : '?'}paymentId=${encodeURIComponent(paymentId)}`

        // 2) 백엔드에 "결제 시작" 알림
        try {
          await paymentRequest(paymentId, bookingId, festivalId, sellerId, amount, userId)
        } catch (e) {
          console.error('paymentRequest 실패', e)
          alert('결제 요청 준비에 실패했어요.')
          return
        }

        // 3) PortOne 결제 요청 멍(redirectUrl로 결과 페이지 진입)
        const result: unknown = await PortOne.requestPayment({
          storeId: STORE_ID!,
          channelKey: CHANNEL_KEY!,
          paymentId,
          orderName: orderName || defaultOrderName,
          totalAmount: amount ?? defaultAmount,
          currency: Currency.KRW,
          payMethod: PayMethod.CARD,
          redirectUrl: finalRedirect,
        })

        console.log(result);

        // ✅ 사용자가 결제창 닫음(취소)
        if (!result) {          
          navigate(`/payment/result?type=booking&status=fail`, { replace: true })
          return
        }

        // 결제 승인 확인
        if (result) {
          const res = await paymentConfirm(paymentId)
          if (res) {
            navigate(`/payment/result?type=booking&status=success`, { replace: true })
          } else {
            navigate(`/payment/result?type=booking&status=fail`, { replace: true })
          }
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
