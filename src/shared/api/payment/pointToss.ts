// src/shared/api/payment/pointToss.ts
import { z } from 'zod'
import { api } from '@/shared/config/axios'

export const PointChargeRequestSchema = z.object({
  paymentId: z.string().min(10, 'paymentId가 올바르지 않습니다.'),
  amount: z.number().int().positive().min(1000, '최소 1,000원 이상 충전해 주세요.'),
})
export type PointChargeRequest = z.infer<typeof PointChargeRequestSchema>

/* 안전한 buyerId 추출 */
function getBuyerIdSafely(): number {
  // 1) localStorage에서 먼저 확인 (Zustand persist 데이터)
  try {
    const authData = localStorage.getItem('auth-storage') || localStorage.getItem('user')
    if (authData) {
      const parsed = JSON.parse(authData)
      const userId = parsed?.state?.user?.userId || parsed?.user?.userId || parsed?.userId
      if (userId && Number.isFinite(Number(userId))) {
        return Number(userId)
      }
    }
  } catch (e) {
    console.warn('localStorage에서 userId 읽기 실패:', e)
  }

  // 2) JWT 토큰에서 추출
  try {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const userId = payload?.userId || payload?.sub || payload?.uid
      if (userId && Number.isFinite(Number(userId))) {
        return Number(userId)
      }
    }
  } catch (e) {
    console.warn('JWT에서 userId 추출 실패:', e)
  }

  throw new Error('로그인 정보를 찾을 수 없습니다. 다시 로그인해 주세요.')
}

/** [1/2] 결제 요청: /payments/request */
export async function requestTossPointCharge(input: PointChargeRequest) {
  const { paymentId, amount } = PointChargeRequestSchema.parse(input)

  const buyerId = getBuyerIdSafely()

  const payload = {
    paymentId,
    amount,
    currency: 'KRW',
    payMethod: 'CARD',
    paymentRequestType: 'POINT_CHARGE_REQUESTED',
    buyerId, // Swagger 명세에 맞춰 포함
  }

  console.debug('[pointToss] POST /payments/request', payload)
  const { data } = await api.post('/payments/request', payload)
  return data
}

/** [2/2] 결제 완료(confirm): /payments/complete/{paymentId} */
export async function confirmPointCharge(paymentId: string) {
  if (!paymentId) throw new Error('paymentId는 필수입니다.')
  const path = `/payments/complete/${encodeURIComponent(paymentId)}`
  console.debug('[pointToss] POST', path)
  const { data } = await api.post(path, {})
  return data
}