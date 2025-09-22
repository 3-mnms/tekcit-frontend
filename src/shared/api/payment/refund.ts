// src/shared/api/payment/refund.ts
import { api } from '@/shared/config/axios'

export async function refundPayment(paymentId: string) {
  if (!paymentId) throw new Error('paymentId는 필수입니다.')

  const res = await api.post(
    `/payments/refund/${encodeURIComponent(paymentId)}`,
    null, // body 없음
  )

  return res.data
}