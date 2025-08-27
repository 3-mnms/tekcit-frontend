// 예매 결제에서 쓰는 유틸

/** ✅ 고유 결제 ID 생성 (브라우저 Crypto 우선) */
export function createPaymentId(): string {
  const c = globalThis.crypto as Crypto | undefined
  if (c?.randomUUID) return c.randomUUID()
  const buf = c?.getRandomValues
    ? c.getRandomValues(new Uint32Array(2))
    : new Uint32Array([Date.now() & 0xffffffff, (Math.random() * 1e9) | 0])
  return `pay_${Array.from(buf).join('')}`
}

/** ✅ 로그인 사용자 ID 획득 (미연동 시 목값 반환) */
export function getUserIdSafely(): number {
  const v = Number(localStorage.getItem('userId') ?? NaN)
  return Number.isFinite(v) ? v : 1001
}
