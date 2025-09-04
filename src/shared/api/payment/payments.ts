// src/shared/api/payment/payments.ts
import { api } from '@/shared/config/axios'

export type PaymentOrderStatus =
  | 'GENERAL_PAYMENT_REQUESTED'
  | 'POINT_PAYMENT_REQUESTED'
  | 'POINT_CHARGE_REQUESTED'

export type PayMethodType = 'TEKCIT_PAY' | 'CARD' | 'TOSS' | 'KAKAO_PAY' | 'BANK_TRANSFER'

export interface PaymentRequestDTO {
  paymentId: string
  bookingId?: string | null
  festivalId?: string | null
  paymentRequestType: PaymentOrderStatus
  buyerId?: number // 서버에서 헤더로도 받지만 DTO 필드는 있어도 무방
  sellerId?: number | null
  amount: number
  currency?: 'KRW'
  payMethod: PayMethodType
}

/** POST /api/payments/request */
export async function requestPayment(dto: PaymentRequestDTO, userId: number): Promise<void> {
  await api.post('/api/payments/request', dto, {
    headers: { 'X-User-Id': String(userId) },
  })
}

/** POST /api/payments/complete/{paymentId} (선택) */
export async function completePayment(paymentId: string): Promise<void> {
  await api.post(`/api/payments/complete/${encodeURIComponent(paymentId)}`)
}
