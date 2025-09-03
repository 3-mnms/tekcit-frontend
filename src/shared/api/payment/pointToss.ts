// src/shared/api/payment/pointToss.ts
// 설명: 포인트 충전의 사전요청/확정 API. sellerId/festivalId/bookingId는 보내지 않으며,
//       buyerId는 바디에 넣지 않고 X-User-Id 헤더로만 보냄.

import { z } from 'zod'
import { api } from '@/shared/config/axios'
import { getUserIdForHeader } from '@/shared/api/payment/tekcit' // X-User-Id 추출 유틸 재사용

// 유효성: 최소 1,000원
export const PointChargeRequestSchema = z.object({
  paymentId: z.string().min(10, 'paymentId가 올바르지 않습니다.'),
  amount: z.number().int().positive().min(1000, '최소 1,000원 이상 충전해 주세요.'),
})
export type PointChargeRequest = z.infer<typeof PointChargeRequestSchema>

/** [1/2] 결제 요청: POST /payments/request
 *  - paymentRequestType: POINT_CHARGE_REQUESTED
 *  - sellerId/festivalId/bookingId: 포함하지 않음
 *  - buyerId: 바디에 넣지 않고 X-User-Id 헤더에만 세팅
 */
export async function requestTossPointCharge(input: PointChargeRequest) {
  const { paymentId, amount } = PointChargeRequestSchema.parse(input)

  // 헤더용 유저 ID 확보(X-User-Id). 없으면 에러
  const uid = getUserIdForHeader()
  if (!uid) throw new Error('로그인이 필요합니다. (X-User-Id 누락)')

  // 포인트 충전에서는 선택 필드들(sellerId/festivalId/bookingId)을 아예 보내지 않음
  const payload = {
    paymentId,
    amount,
    currency: 'KRW',
    payMethod: 'CARD',
    paymentRequestType: 'POINT_CHARGE_REQUESTED',
  }

  // X-User-Id 헤더만 추가
  const { data } = await api.post('/payments/request', payload, {
    headers: { 'X-User-Id': String(uid) },
  })
  return data
}

/** [2/2] 결제 완료(confirm): POST /payments/complete/{paymentId}
 *  - 확정에도 X-User-Id 헤더를 동일하게 부착
 */
export async function confirmPointCharge(paymentId: string) {
  if (!paymentId) throw new Error('paymentId는 필수입니다.')
  const uid = getUserIdForHeader()
  if (!uid) throw new Error('로그인이 필요합니다. (X-User-Id 누락)')

  const path = `/payments/complete/${encodeURIComponent(paymentId)}`
  const { data } = await api.post(path, {}, { headers: { 'X-User-Id': String(uid) } })
  return data
}
