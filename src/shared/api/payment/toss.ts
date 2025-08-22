import { api } from '../axios'

/** 결제 사전요청 멍 */
export const paymentRequest = async (
  paymentId: string,   // 결제ID(프론트 생성) 멍
  bookingId: string,   // 가예매ID 멍
  festivalId: string,  // 공연ID 멍
  sellerId: number,    // 판매자ID 멍
  amount: number,      // 금액 멍
  userId: number,      // 로그인 사용자 ID (X-User-Id 헤더로 전달) 멍
) => {
  const body = {
    paymentId,
    bookingId,
    festivalId,
    eventType: 'Payment_Requested', // ✅ 백엔드 enum 값에 맞춤 멍
    sellerId,
    amount,
    currency: 'KRW',
    payMethod: 'CARD',
    // buyerId는 백엔드에서 X-User-Id 헤더로 세팅하므로 body에서 제외
  }

  const res = await api.post('/payments/request', body, {
    headers: {
      'X-User-Id': String(userId), 
      'Content-Type': 'application/json',
    },
  })

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`paymentRequest 실패: ${res.status}`)
  }
  return res.data // 백엔드 응답 스키마는 상위에서 해석 멍
}

/** 결제 승인 확인(간단 재시도 3회: 2/4/6초) 멍 */
// 📄 src/shared/api/payment/toss.ts (paymentConfirm만 교체) 멍
export const paymentConfirm = async (paymentId: string) => {
  const MAX_TRIES = 3

  console.log("payment confirm action");
  
  for (let tryCount = 0; tryCount < MAX_TRIES; tryCount++) {
    // ⏳ 2/4/6초 대기
    await new Promise((r) => setTimeout(r, (tryCount + 1) * 2000))

    try {
      const res = await api.post(`/payments/complete/${paymentId}`)
      console.log(`paymentConfirm 시도 ${tryCount + 1}:`, res   );
      
      // ✅ axios는 res.ok가 없음 → status로 확인 멍
      if (res.status >= 200 && res.status < 300) {
        return res.data // 승인 완료 멍
      }
      // 비-2xx면 다음 루프에서 재시도 멍
    } catch {
      // 네트워크/서버 오류 → 다음 루프 재시도 멍
    }
  }

  // ❌ 모든 재시도 실패 시 예외 던짐
  throw new Error('paymentConfirm 실패 (모든 재시도 실패) 멍')
}
