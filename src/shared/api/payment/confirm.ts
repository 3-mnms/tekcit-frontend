import { api } from '@/shared/config/axios'

/** 결제 승인 확인(재시도 2/4/6초) */
export async function paymentConfirm(paymentId: string) {
  const MAX_TRIES = 3
  for (let i = 0; i < MAX_TRIES; i++) {
    await new Promise((r) => setTimeout(r, (i + 1) * 2000)) // ⏳ 2/4/6초 대기
    try {
      const res = await api.post(`/payments/complete/${paymentId}`)
      if (res.status >= 200 && res.status < 300) return res.data // ✅ 승인 성공
    } catch {
      // 네트워크/서버오류 → 다음 시도
    }
  }
  throw new Error('paymentConfirm 실패 (모든 재시도 실패)') // ❌ 실패
}
