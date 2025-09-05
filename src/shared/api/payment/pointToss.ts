// src/shared/api/payment/pointToss.ts
import { z } from 'zod'
import { api } from '@/shared/config/axios'

export const PointChargeRequestSchema = z.object({
  paymentId: z.string().min(10, 'paymentId가 올바르지 않습니다.'),
  amount: z.number().int().positive().min(1000, '최소 1,000원 이상 충전해 주세요.'),
})
export type PointChargeRequest = z.infer<typeof PointChargeRequestSchema>

export async function requestTossPointCharge(
  input: PointChargeRequest,
  userId: number,
) {
  const { paymentId, amount } = PointChargeRequestSchema.parse(input)
  const payload = {
    paymentId,
    amount,
    currency: 'KRW',
    payMethod: 'POINT_CHARGE',
    paymentRequestType: 'POINT_CHARGE_REQUESTED',
  }
  const response = await api.post('/payments/request', payload, {
    headers: { 'X-User-Id': String(userId) },
  })
  return response.data
}

export async function confirmPointCharge(paymentId: string, userId?: number) {
  const path = `/payments/complete/${encodeURIComponent(paymentId)}`
  const response = await api.post(path, {}, {
    headers: userId ? { 'X-User-Id': String(userId) } : undefined,
  })
  return response.data
}
