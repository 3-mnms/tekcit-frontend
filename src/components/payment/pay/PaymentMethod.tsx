// PaymentMethod.tsx
import { useState } from 'react'
import WalletPayment from '@components/payment/pay/WalletPayment'
import CardSimplePayment from '@components/payment/pay/CardSimplePayment'
import type { SimpleMethod } from '@components/payment/pay/CardSimplePayment'
import GeneralCardPayment from '@components/payment/pay/GeneralCardPayment'

import styles from './PaymentMethod.module.css'

interface PaymentMethodProps {
  onSelect?: (method: string) => void
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({ onSelect }) => {
  const [method, setMethod] = useState<'wallet' | 'simple' | 'general' | null>(null)

  // ✅ 넓혀서 받기: SimpleMethod 전체 허용
  const handleSimpleSelect = (m: SimpleMethod) => {
    setMethod('simple')
    onSelect?.(m)
  }

  return (
    <div className={styles.container}>
      <WalletPayment
        isOpen={method === 'wallet'}
        onToggle={() => {
          setMethod('wallet')
          onSelect?.('킷페이')
        }}
      />

      <CardSimplePayment
        isOpen={method === 'simple'}
        onToggle={() => setMethod('simple')}
        onSelect={handleSimpleSelect}
        methods={['네이버페이', '카카오페이', '토스페이']}
      />

      <GeneralCardPayment
        isOpen={method === 'general'}
        onToggle={() => {
          setMethod('general')
          onSelect?.('일반결제')
        }}
      />
    </div>
  )
}

export default PaymentMethod
