// src/shared/api/payment/refund.ts
import { api } from '@/shared/config/axios'

/**
 * 환불 API 호출 함수
 * @param paymentId 결제 식별자 (path param)
 * 
 * 주의: X-User-Id는 axios 인터셉터에서 JWT 토큰으로부터 자동 주입됨
 */
export async function refundPayment(paymentId: string) {
  if (!paymentId) throw new Error('paymentId는 필수입니다.')

  const res = await api.post(
    `/payments/refund/${encodeURIComponent(paymentId)}`, // baseURL이 /api이므로 /api 제거
    null, // body 없음
  )

  return res.data
}