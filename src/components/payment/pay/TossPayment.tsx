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

function createPaymentId(): string {
  const c = globalThis.crypto
  if (c?.randomUUID) return c.randomUUID()
  const buf = c?.getRandomValues ? c.getRandomValues(new Uint32Array(2)) : new Uint32Array([Date.now() & 0xffffffff, (Math.random() * 1e9) | 0])
  return `pay_${Array.from(buf).join('')}`
}

type PortOneError = { code: string; message?: string }
const isPortOneError = (v: unknown): v is PortOneError =>
  !!v &&
  typeof v === 'object' &&
  'code' in (v as Record<string, unknown>) &&
  typeof (v as Record<string, unknown>).code === 'string'

const TossPayment = forwardRef<TossPaymentHandle, TossPaymentProps>(
  ({ isOpen, onToggle, amount, orderName, redirectUrl }, ref) => {
    useImperativeHandle(ref, () => ({
      async requestPay() {
        if (!STORE_ID || !CHANNEL_KEY) {
          alert('PortOne storeId/channelKey가 설정되지 않았어요(.env 확인) 멍')
          return
        }
        const paymentId = createPaymentId()
        const base = redirectUrl ?? `${window.location.origin}/payment/result?type=booking`
        const finalRedirect = `${base}${base.includes('?') ? '&' : '?'}paymentId=${encodeURIComponent(paymentId)}`

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
        if (isPortOneError(result)) alert(`결제 실패: ${result.message ?? result.code} 멍`)
      },
    }))

    return (
      <div className={styles.card}>
        {/* 헤더: 로고 + 타이틀 + 서브카피 + 라디오 멍 */}
        <button
          type="button"
          className={styles.header}
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-pressed={isOpen}
        >
          <div className={styles.left}>
            <div className={styles.titles}>
              <span className={styles.title}>토스 페이먼츠</span>
              <span className={styles.sub}>신용/체크/간편결제</span>
            </div>
          </div>
          <div className={styles.right}>
          </div>
        </button>
      </div>
    )
  }
)

TossPayment.displayName = 'TossPayment'
export default TossPayment
