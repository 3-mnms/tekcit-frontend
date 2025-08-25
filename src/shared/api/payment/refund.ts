import { api } from '@/shared/api/axios'

function getUserIdOrThrow(): number {
  const raw = localStorage.getItem('userId')
  const uid = raw ? Number(raw) : NaN
  if (!uid || Number.isNaN(uid)) {
    throw new Error('로그인 정보가 없습니다. (userId 누락)')
  }
  return uid
}

export async function requestFullRefund(paymentId: string) {
  const userId = getUserIdOrThrow()

  const res = await api.post(`/payments/refund/${encodeURIComponent(paymentId)}`, null, {
    headers: {
      'X-User-Id': String(userId), 
    },
  })

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`refundPayment 실패: ${res.status}`)
  }
  return res.data 
}

