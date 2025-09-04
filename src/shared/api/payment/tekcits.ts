// src/shared/api/payment/tekcit.ts
import { api } from '@/shared/config/axios'

export interface PayByTekcitPayDTO {
  amount: number
  paymentId: string
  password: string
}

/** POST /api/tekcitpay  (비번 검증 + 결제) */
export async function payByTekcitPay(payload: PayByTekcitPayDTO, userId: number): Promise<void> {
  await api.post('/tekcitpay', payload, {
    headers: { 'X-User-Id': String(userId) },
  })
}

/** 모달에서 불러 쓰는 래퍼 (이름 유지) */
export async function verifyTekcitPassword(payload: PayByTekcitPayDTO, userId: number): Promise<void> {
  return payByTekcitPay(payload, userId)
}
