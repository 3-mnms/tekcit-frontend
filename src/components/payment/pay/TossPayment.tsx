import { forwardRef, useImperativeHandle } from 'react'
import PortOne, { Currency, PayMethod } from '@portone/browser-sdk/v2'
import styles from './TossPayment.module.css'

export interface TossPaymentProps {
  isOpen: boolean
  onToggle: () => void
  amount: number
  orderName: string
  redirectUrl?: string
}

export type TossPaymentHandle = { requestPay: () => Promise<void> }

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

const TossPayment = forwardRef<TossPaymentHandle, TossPaymentProps>(
  ({ isOpen, onToggle, amount, orderName, redirectUrl }, ref) => {
    // TossPayment.tsx (일부)
    useImperativeHandle(ref, () => ({
      async requestPay() {
        if (!STORE_ID || !CHANNEL_KEY) {
          alert('PortOne storeId/channelKey가 설정되지 않았습니다(.env 확인).')
          return
        }

        const paymentId = createPaymentId()

        // ✅ 1) 리다이렉트 기본 베이스 (부모가 넘기면 그거 사용, 없으면 booking 결과 페이지)
        const base = redirectUrl ?? `${window.location.origin}/payment/result?type=booking`

        // ✅ 2) paymentId 쿼리로 추가
        const finalRedirect = `${base}${base.includes('?') ? '&' : '?'}paymentId=${encodeURIComponent(paymentId)}`

        // ✅ 3) PortOne 호출 시 최종 redirectUrl 주입
        const result: unknown = await PortOne.requestPayment({
          storeId: STORE_ID,
          channelKey: CHANNEL_KEY,
          paymentId,
          orderName,
          totalAmount: amount,
          currency: Currency.KRW,
          payMethod: PayMethod.CARD,
          redirectUrl: finalRedirect,
        })

        if (isPortOneError(result)) {
          alert(`결제 실패: ${result.message ?? result.code}`)
        }
      },
    }))

    return (
      <div className={styles['toss-payment-container']}>
        <div className={styles['payment-section']}>
          <label className={styles['simple-payment-option']}>
            <input
              type="radio"
              id="toss-payment"
              name="payment-method"
              checked={isOpen}
              onChange={onToggle}
            />
            <span className={styles['radio-label']}>토스 페이먼츠 (신용/체크카드/간편결제)</span>
          </label>

          <div
            className={`${styles['toss-payment-slide']} ${isOpen ? styles.open : ''}`}
            role="region"
            aria-labelledby="toss-payment"
          >
            <div className={styles['toss-payment-section']}>
              <p className={styles['selectLabel']}>
                이 결제는 토스 페이먼츠로 결제됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

TossPayment.displayName = 'TossPayment'
export default TossPayment
