import { forwardRef, useImperativeHandle } from 'react'
import PortOne, { Currency, PayMethod } from '@portone/browser-sdk/v2'
import styles from './TossPayment.module.css'
import { paymentConfirm, paymentRequest } from '@/shared/api/payment/wallet'

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
  const buf = c?.getRandomValues
    ? c.getRandomValues(new Uint32Array(2))
    : new Uint32Array([Date.now() & 0xffffffff, (Math.random() * 1e9) | 0])
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
          alert('PortOne storeId/channelKey가 설정되지 않았어요.')
          return
        }

        const paymentId = createPaymentId()
        const base = redirectUrl ?? `${window.location.origin}/payment/result?type=booking`
        const finalRedirect = `${base}${base.includes('?') ? '&' : '?'}paymentId=${encodeURIComponent(paymentId)}`

        // bookingId는 가예매 상태일 때 미리 받아서 갖고 있다가 넣어줘야 함.
        // festivalId,sellerId는 게시글 받아올 때 요청으로 받아와야 함.
        const paymentReqestRes = paymentRequest(paymentId, bookingId, festivalId, sellerId, amount)
        // -> 응답이 true일 때 52번 line portOne이 실행 돼야 함.

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

        // PortOne이 PAID인지 아닌지 모르겠는데 상태 반환해주는 거 보고 밑에 paymentConfirm 실행
        const paymentConfirmRes = paymentConfirm(paymentId)

        // paymentConfirmRes가 ok 즉, 200을 반환하면 결제 완료 후 navigate 시켜주면 됨.
        if (isPortOneError(result)) alert(`결제 실패: ${result.message ?? result.code}`)
      },
    }))

    return (
      <div className={styles.wrapper}>
        <button type="button" className={styles.header} onClick={onToggle} aria-expanded={isOpen}>
          <span className={styles.radio + (isOpen ? ` ${styles.radioOn}` : '')} />
          <div className={styles.info}>
            <span className={styles.title}>토스 페이먼츠</span>
            <span className={styles.sub}>신용/체크카드 / 간편결제</span>
          </div>
        </button>
      </div>
    )
  },
)

TossPayment.displayName = 'TossPayment'
export default TossPayment
