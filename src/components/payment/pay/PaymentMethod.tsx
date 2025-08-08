// PaymentMethod.tsx
import { useState } from 'react'
import WalletPayment from '@components/payment/pay/WalletPayment'
import CardSimplePayment from '@components/payment/pay/CardSimplePayment'
import GeneralCardPayment from '@components/payment/pay/GeneralCardPayment'

import styles from './PaymentMethod.module.css'

interface PaymentMethodProps {
  onSelect?: (method: string) => void
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({ onSelect }) => {
  const [method, setMethod] = useState<'wallet' | 'simple' | 'general' | null>(null)

  // 카드 간편 결제에서 실제 선택값 받을 때
  const handleSimpleSelect = (method: '네이버페이' | '카카오페이') => {
    setMethod('simple')
    onSelect?.(method) // ★ 바로 올려줌
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
