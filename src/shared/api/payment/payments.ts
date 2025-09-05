import { api } from '@/shared/config/axios'

export type PaymentOrderStatus =
  | 'GENERAL_PAYMENT_REQUESTED'
  | 'POINT_PAYMENT_REQUESTED'
  | 'POINT_CHARGE_REQUESTED'

export type PayMethodType = 'CARD' | 'POINT_PAYMENT' | 'POINT_CHARGE'

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

export interface TransferFeePaymentDTO {
  sellerId: number
  paymentId: string
  bookingId: string
  totalAmount: number
  commission: number
}

export interface PayByTekcitPayDTO {
  amount: number
  paymentId: string
  password: string
}

/** POST /api/payments/request */
export async function requestPayment(dto: PaymentRequestDTO, userId: number): Promise<void> {
  await api.post('/payments/request', dto, {
    headers: { 'X-User-Id': String(userId) },
  })
}

/** POST /api/tekcitpay/transfer */
export async function requestTransferFeePayment(
  dto: TransferFeePaymentDTO,
  userId: number,
): Promise<void> {
  await api.post('/tekcitpay/transfer', dto, {
    headers: { 'X-User-Id': String(userId) },
  })
}

/** POST /api/tekcitpay */
export async function requestTekcitPay(
  dto: PayByTekcitPayDTO,
  userId: number,
): Promise<void> {
  await api.post('/tekcitpay', dto, {
    headers: { 'X-User-Id': String(userId) },
  })
}

/** POST /api/payments/complete/{paymentId} */
export async function completePayment(paymentId: string): Promise<void> {
  await api.post(`/payments/complete/${encodeURIComponent(paymentId)}`)
}
