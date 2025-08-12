// components/payment/pay/GeneralCardPayment.tsx
import { forwardRef, useImperativeHandle } from 'react'
import PortOne, { Currency, PayMethod } from '@portone/browser-sdk/v2'
import styles from './GeneralCardPayment.module.css'

export interface GeneralCardPaymentProps {
  isOpen: boolean
  onToggle: () => void
  amount: number
  orderName: string
  redirectUrl?: string
}

export type GeneralCardPaymentHandle = { requestPay: () => Promise<void> }

// 실제에선 .env로 관리 권장
const STORE_ID = import.meta.env.VITE_PORTONE_STORE_ID?.trim()
const CHANNEL_KEY = import.meta.env.VITE_PORTONE_CHANNEL_KEY?.trim()

// 결제 ID 생성 유틸 (any 없이)
function createPaymentId(): string {
  const c = globalThis.crypto
  if (c && typeof c.randomUUID === 'function') return c.randomUUID()
  const buf =
    c && typeof c.getRandomValues === 'function'
      ? c.getRandomValues(new Uint32Array(2))
      : new Uint32Array([Date.now() & 0xffffffff, (Math.random() * 1e9) | 0])
  return `pay_${Array.from(buf).join('')}`
}

// PortOne 에러 형태 최소 정의
type PortOneError = { code: string; message?: string }
function isPortOneError(v: unknown): v is PortOneError {
  if (typeof v !== 'object' || v === null) return false
  return typeof (v as Record<string, unknown>).code === 'string'
}

const GeneralCardPayment = forwardRef<GeneralCardPaymentHandle, GeneralCardPaymentProps>(
  ({ isOpen, onToggle, amount, orderName, redirectUrl }, ref) => {
    useImperativeHandle(ref, () => ({
      async requestPay() {
        if (!STORE_ID || !CHANNEL_KEY) {
          alert('PortOne storeId/channelKey가 설정되지 않았습니다(.env 확인).')
          return
        }

        const paymentId = createPaymentId()

        // enum 사용 → 타입 에러 방지 멍
        const result: unknown = await PortOne.requestPayment({
          storeId: STORE_ID,
          channelKey: CHANNEL_KEY,
          paymentId,
          orderName,
          totalAmount: amount,
          currency: Currency.KRW,   // ← Currency도 보통 대문자 키 멍
          payMethod: PayMethod.CARD, // ← 여기! Card → CARD 로 수정 멍
          redirectUrl: redirectUrl ?? `${window.location.origin}/payment/portone/success`,
        })

        if (isPortOneError(result)) {
          alert(`결제 실패: ${result.message ?? result.code}`)
        }
        // 성공/실패 이후 라우팅은 리다이렉트/결과 페이지에서 처리 멍
      },
    }))

    return (
      <div className={styles['general-card-payment-container']}>
        <div className={styles['payment-section']}>
          <label className={styles['simple-payment-option']}>
            <input
              type="radio"
              id="general-payment"
              name="payment-method"
              checked={isOpen}
              onChange={onToggle}
            />
            <span className={styles['radio-label']}>일반 결제 (신용/체크카드)</span>
          </label>

          <div
            className={`${styles['general-payment-slide']} ${isOpen ? styles.open : ''}`}
            role="region"
            aria-labelledby="general-payment"
          >
            <div className={styles['general-payment-section']}>
              <p className={styles['selectLabel']}>
                이 결제는 PortOne 결제창에서 처리되며 채널은 토스페이먼츠입니다 멍.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

GeneralCardPayment.displayName = 'GeneralCardPayment'
export default GeneralCardPayment
