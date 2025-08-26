// ✅ 결제/페이지에서 공유하는 상수와 타입을 모아둔 파일 멍

/** 접근성: 메인 타이틀의 DOM id 멍 */
export const PAGE_TITLE_ID = 'bookingPaymentMainTitle'

/** 결제 타이머(초) 멍 */
export const DEADLINE_SECONDS = 5 * 60

/** 결제 수단(매직스트링 제거) 멍 */
export enum PaymentMethod {
  Wallet = 'wallet',
  Toss = 'Toss',
}
