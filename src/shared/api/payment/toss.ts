// 포트원 토스 페이먼츠 api 호출

import type { TossPaymentBody } from '@/models/payment/types/paymentTypes'
import { postWithUserId } from './payment'

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

    console.log(payload);

  return postWithUserId('/payments/request', payload)
}

export interface TossConfirmBody {
  paymentKey: string  // Toss에서 리다이렉트로 돌려준 paymentKey 멍
  orderId: string     // 우리 시스템의 paymentId (= orderId) 멍
  amount: number      // 결제 금액 멍
}

export async function paymentConfirm(body: TossConfirmBody) {
  const payload = {
    ...body,
    paymentRequestType: 'GENERAL_PAYMENT_CONFIRMED', // 백엔드 구분용
  }
  return postWithUserId('/payments/confirm', payload)
}

/** ✅ 예매 결제(토스) */
export async function requestTossBookingPayment(body: TossPaymentBody) {
  const payload = {
    ...body,
    currency: 'KRW',
    payMethod: 'CARD',
    paymentRequestType: 'GENERAL_PAYMENT_REQUESTED',
  }
  console.log(payload);
  
  return postWithUserId('/payments/request', payload)
}

/** ✅ 양도 결제(토스) — bookingId/festivalId/sellerId/amount만 다르게 넣어 호출 */
export async function requestTossTransferPayment(body: TossPaymentBody) {
  const payload = {
    ...body,
    currency: 'KRW',
    payMethod: 'CARD',
    eventType: 'Payment_Requested',
    paymentRequestType: 'GENERAL_PAYMENT_REQUESTED',
  }
  return postWithUserId('/payments/request', payload)
}

/** ✅ 양도 수수료 결제(토스) — 동일 엔드포인트, amount만 수수료 기준으로 설정 */
export async function requestTossTransferFeePayment(body: TossPaymentBody) {
  const payload = {
    ...body,
    currency: 'KRW',
    payMethod: 'CARD',
    eventType: 'Payment_Requested',
    paymentRequestType: 'GENERAL_PAYMENT_REQUESTED',
  }
  return postWithUserId('/payments/request', payload)
}

