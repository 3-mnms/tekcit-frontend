// PaymentMethod.tsx
import { useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react'
import WalletPayment from '@components/payment/pay/WalletPayment'
import GeneralCardPayment, {
  type GeneralCardPaymentHandle,
} from '@components/payment/pay/GeneralCardPayment'

import styles from './PaymentMethod.module.css'

interface PaymentMethodProps {
  onSelect?: (method: 'wallet' | 'general') => void
  amount: number
  orderName: string
}

export type PaymentMethodHandle = {
  getMethod: () => 'wallet' | 'general' | null
  requestPay: () => Promise<void> // 일반결제일 때만 의미 있음
}

const PaymentMethod = forwardRef<PaymentMethodHandle, PaymentMethodProps>(
  ({ onSelect, amount, orderName }, ref) => {
    const [method, setMethod] = useState<'wallet' | 'general' | null>(null)
    const generalRef = useRef<GeneralCardPaymentHandle | null>(null)

    const selectMethod = useCallback(
      (m: 'wallet' | 'general') => {
        setMethod(m)
        onSelect?.(m)
      },
      [onSelect],
    )

    useImperativeHandle(ref, () => ({
      getMethod: () => method,
      requestPay: async () => {
        if (method !== 'general') return
        await generalRef.current?.requestPay()
      },
    }), [method])

    return (
      <div className={styles.container}>
        <WalletPayment
          isOpen={method === 'wallet'}
          onToggle={() => selectMethod('wallet')}
        />

        <GeneralCardPayment
          ref={generalRef}
          isOpen={method === 'general'}
          onToggle={() => selectMethod('general')}
          amount={amount}
          orderName={orderName}
        />
      </div>
    )
  },
)

export default PaymentMethod
