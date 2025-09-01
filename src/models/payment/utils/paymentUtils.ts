// 예매 결제에서 쓰는 유틸

import { useAuthStore } from '@/shared/storage/useAuthStore'

/** ✅ 고유 결제 ID 생성 (브라우저 Crypto 우선) */
export function createPaymentId(): string {
  const c = globalThis.crypto as Crypto | undefined
  if (c?.randomUUID) return c.randomUUID()
  const buf = c?.getRandomValues
    ? c.getRandomValues(new Uint32Array(2))
    : new Uint32Array([Date.now() & 0xffffffff, (Math.random() * 1e9) | 0])
  return `pay_${Array.from(buf).join('')}`
}

/** ✅ 로그인 사용자 ID 획득 */
export function getUserIdSafely(): number {
  // Zustand는 컴포넌트 외부에서 getState() 호출 가능
  const user = useAuthStore.getState().user
  if (!user) {
    // ❗ 이 에러는 상위에서 잡아 "로그인 필요" 토스트/모달을 띄우는 용도로 사용
    throw new Error('로그인이 필요합니다.')
  }
  return user.userId
}
