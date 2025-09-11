// src/shared/api/payment/payments.ts
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
  STORE_KEY: string
  CHANNEL_KEY: string
}

/** GET /api/payments/{bookingId} → 결제 정보 조회 (paymentId, amount 등) */
export interface PaymentInfoByBooking {
  paymentId: string
  amount: number
  currency: string
  payMethod: PayMethodType
  payTime: string
  paymentStatus: string
}

export interface RequestTransferPaymentDTO {
  sellerId: number
  paymentId: string
  bookingId: string
  totalAmount: number
  commission: number
}

export interface RequestTekcitPayDTO {
  amount: number            // 결제 금액(원)
  paymentId: string         // 결제 ID
  password: string          // 지갑 비밀번호
  toUserId?: number         // ▶︎ 입금 받을 사용자 ID(관리자 ID)
}

/** POST /api/payments/request */
export async function requestPayment(dto: PaymentRequestDTO, userId: number): Promise<void> {
  await api.post('/payments/request', dto, {
    headers: { 'X-User-Id': String(userId) },
  })
}

/** POST /api/payments/complete/{paymentId} (선택) */
export async function completePayment(paymentId: string): Promise<void> {
  await api.post(`/payments/complete/${encodeURIComponent(paymentId)}`)
}

/** POST /api/tekcitpay/transfer */
export async function requestTransferPayment(
  dto: RequestTransferPaymentDTO,
  userId: number,
): Promise<void> {
  await api.post('/tekcitpay/transfer', dto, {
    headers: { 'X-User-Id': String(userId) },
  })
}

/** POST /api/tekcitpay */
export async function requestTekcitPay(
  dto: RequestTekcitPayDTO,
  userId: number,
): Promise<void> {
  // 요청 전 디버그 로그
  console.debug('[payments] requestTekcitPay:request', {
    baseURL: (api.defaults as any)?.baseURL,
    path: '/tekcitpay',
    payload: dto,
    headers: { 'X-User-Id': String(userId) },
  })

  await api.post('/tekcitpay', dto, {
    headers: { 'X-User-Id': String(userId) },
  })

  // 성공 로그
  console.debug('[payments] requestTekcitPay:success', {
    paymentId: dto.paymentId,
    amount: dto.amount,
    toUserId: dto.toUserId,
    purpose: dto.purpose,
  })
}


/**
 * 예약번호(bookingId)로 결제 정보 조회 → PaymentInfoByBooking 반환
 * (paymentId, amount 등을 포함)
 */
export async function getPaymentIdByBookingId(
  bookingId: string,
  userId: number,
): Promise<PaymentInfoByBooking | null> {
  const { data } = await api.get(`/payments/${encodeURIComponent(bookingId)}`, {
    headers: { 'X-User-Id': String(userId) },
  })
  return (data?.data ?? null) as PaymentInfoByBooking | null
}
