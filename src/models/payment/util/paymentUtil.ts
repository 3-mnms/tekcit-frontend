// ✅ 결제 관련 범용 유틸 모음 멍

/** 고유 결제 ID 생성(브라우저 표준 API 우선) 멍 */
export function createPaymentId(): string {
  // ── crypto.randomUUID가 있으면 그걸 사용 멍
  const c = globalThis.crypto as Crypto | undefined
  if (c?.randomUUID) return c.randomUUID()

  // ── 폴백: 랜덤 바이트/타임스탬프 조합 멍
  const buf = c?.getRandomValues
    ? c.getRandomValues(new Uint32Array(2))
    : new Uint32Array([Date.now() & 0xffffffff, (Math.random() * 1e9) | 0])
  return `pay_${Array.from(buf).join('')}`
}

/** (예시) 로그인 사용자 ID 안전 획득 멍
 *  실제 프로젝트에선 auth store/context/cookie로 교체 멍
 */
export function getUserIdSafely(): number {
  const v = Number(localStorage.getItem('userId') ?? NaN)
  return Number.isFinite(v) ? v : 1001 // 연동안이면 목값 1001 멍
}

/** mm:ss 포맷 문자열 생성 멍 */
export function formatRemain(remainingSeconds: number): string {
  const m = String(Math.floor(remainingSeconds / 60)).padStart(2, '0')
  const s = String(remainingSeconds % 60).padStart(2, '0')
  return `${m}:${s}`
}
