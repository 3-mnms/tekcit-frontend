// src/shared/api/payment/pointToss.ts
import { z } from 'zod'
import { api } from '@/shared/config/axios' // axios 인스턴스 직접 사용

/* ───────────────────────── 타입/스키마 ───────────────────────── */
export const PointChargeRequestSchema = z.object({
  paymentId: z.string().min(10, 'paymentId가 올바르지 않습니다.'),
  amount: z.number().int().positive().min(1000, '최소 1,000원 이상 충전해 주세요.'),
})
export type PointChargeRequest = z.infer<typeof PointChargeRequestSchema>

/* ───────────────────────── API 함수 ───────────────────────── */

/** ✅ [1/2] 결제 요청: /payments/request */
export async function requestTossPointCharge(input: PointChargeRequest) {
  const { paymentId, amount } = PointChargeRequestSchema.parse(input)

  const payload = {
    paymentId,
    amount,
    currency: 'KRW',
    payMethod: 'CARD',
    paymentRequestType: 'POINT_CHARGE_REQUESTED',
    // bookingId, festivalId, sellerId는 서버에서 자동 처리
  }

  console.debug('[pointToss] POST /payments/request', payload)
  const response = await api.post('/payments/request', payload)
  return response.data
}

/** ✅ [2/2] 결제 완료: /payments/complete/{paymentId} */
export async function confirmPointCharge(paymentId: string) {
  const path = `/payments/complete/${encodeURIComponent(paymentId)}`
  console.debug('[pointToss] POST', path)
  const response = await api.post(path, {})
  return response.data
}