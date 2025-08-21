import { api } from '@/shared/api/axios'

/** 서버 공통 응답 래퍼 타입 */
type SuccessResponse<T> = { data: T; message?: string }

/** X-User-Id 해석: localStorage 우선 사용 */
function resolveUserId(): string {
  const id = localStorage.getItem('userId')
  if (id && id !== 'null' && id !== 'undefined') return id
  throw new Error('X-User-Id 가 비어있습니다. 로그인 상태를 확인해 주세요.')
}

/** 전액 환불 요청: POST /api/payments/refund/{paymentId} */
export async function requestFullRefund(paymentId: string): Promise<string | undefined> {
  // 백엔드에서 X-User-Id 필수
  const userId = resolveUserId()
  const res = await api.post<SuccessResponse<string>>(
    `/payments/refund/${encodeURIComponent(paymentId)}`,
    undefined,
    { headers: { 'X-User-Id': userId } } // ✅ 필수 헤더
  )
  // 서버가 식별자/메시지를 data에 담아줄 수 있어 그대로 반환
  return res.data?.data
}
