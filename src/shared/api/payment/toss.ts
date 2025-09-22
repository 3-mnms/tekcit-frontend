// 포트원 토스 페이먼츠 api 호출

import type { TossPaymentBody } from '@/models/payment/types/paymentTypes'
// import { postWithUserId } from './payment'
import { requestPayment, completePayment } from '@/shared/api/payment/payments'

const DUMMY_USER_ID = 1

/** 결제 사전요청 멍 */
export const paymentRequest = async (
  paymentId: string, // 결제ID (프론트에서 생성함)
  bookingId: string, // 가예매ID
  festivalId: string, // 공연ID
  sellerId: number, // 판매자ID
  amount: number, // 금액
  // buyerId가 userId로 되기 때문에 따로 안적음, X-User-Id 헤더로 덮어씌워짐
) => {
  const payload = {
    paymentId,
    bookingId,
    festivalId,
    sellerId,
    amount,
    currency: 'KRW',
    payMethod: 'CARD',
    paymentRequestType: 'GENERAL_PAYMENT_REQUESTED',
  }
  // return postWithUserId('/payments/request', payload)
  return requestPayment(payload, DUMMY_USER_ID)
}

// // 결제 결과 확인 API
// export async function paymentConfirm(paymentId: string) {
//   return postWithUserId(`/payments/complete/${paymentId}`, {})
// }

// 결제 결과 확인 API
export async function paymentConfirm(paymentId: string) {
  return completePayment(paymentId)
}

/** ✅ 예매 결제(토스) */
export async function requestTossBookingPayment(body: TossPaymentBody) {
  const payload = {
    ...body,
    currency: 'KRW',
    payMethod: 'CARD',
    paymentRequestType: 'GENERAL_PAYMENT_REQUESTED',
  }

  // return postWithUserId('/payments/request', payload)
  return requestPayment(payload, DUMMY_USER_ID)  
}

