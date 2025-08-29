// 결제 수단 선택 컴포넌트

import { forwardRef } from 'react'
import WalletPayment from '@/components/payment/pay/WalletPayment'
import TossPayment, { type TossPaymentHandle } from '@/components/payment/pay/TossPayment'
import type { PaymentMethod } from '@/models/payment/types/paymentTypes'
import styles from '@/pages/payment/BookingPaymentPage.module.css'

type Props = {
  openedMethod: PaymentMethod | null
  onToggle: (m: PaymentMethod) => void
  amount: number
  orderName: string
  errorMsg?: string | null
  bookingId: string
  festivalId: string
  sellerId: number
}

const PaymentSection = forwardRef<TossPaymentHandle, Props>(function PaymentMethods(
  { openedMethod, onToggle, amount, orderName, errorMsg, bookingId, festivalId, sellerId },
  tossRef,
) {
  return (
    <section className={styles.paymentBox}>
      {/* 킷페이 아직 UI만 있음 (연동전임)*/}
      <div className={styles.methodCard}>
        <button
          className={styles.methodHeader}
          onClick={() => onToggle('wallet')}
          aria-expanded={openedMethod === 'wallet'}
          type="button"
        >
          <span
            className={styles.radio + (openedMethod === 'wallet' ? ` ${styles.radioOn}` : '')}
          />
          <span className={styles.methodText}>킷페이 (포인트 결제)</span>
        </button>

        {openedMethod === 'wallet' && (
          <div className={styles.methodBody}>
            {/* 결제하기 실행은 페이지 버튼에서 ref로 호출함 */}
            <WalletPayment isOpen onToggle={() => onToggle('wallet')} dueAmount={amount} />
          </div>
        )}
      </div>

      {/* 토스 */}
      <div className={styles.methodCard}>
        <button
          className={styles.methodHeader}
          onClick={() => onToggle('Toss')}
          aria-expanded={openedMethod === 'Toss'}
          type="button"
        >
          <span className={styles.radio + (openedMethod === 'Toss' ? ` ${styles.radioOn}` : '')} />
          <span className={styles.methodText}>토스페이먼츠 (신용/체크)</span>
        </button>

        {openedMethod === 'Toss' && (
          <div className={styles.methodBody}>
            {/* ✅ TossPayment가 요구하는 모든 필수 props 전달 */}
            <TossPayment
              ref={tossRef} // 페이지에서 tossRef.current?.requestPay(...) 호출
              isOpen
              onToggle={() => onToggle('Toss')}
              amount={amount}
              orderName={orderName}
              redirectUrl={`${window.location.origin}/payment/result?type=booking`}
              bookingId={bookingId}
              festivalId={festivalId}
              sellerId={sellerId}
            />
          </div>
        )}
      </div>

      {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}
    </section>
  )
})

export default PaymentSection
