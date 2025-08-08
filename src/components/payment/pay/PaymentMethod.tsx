// src/components/payment/pay/PaymentMethod.tsx
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

  const handleMethodChange = (selected: typeof method) => {
    setMethod(selected)
    if (selected === 'wallet') {
      onSelect?.('킷페이') // 상위 컴포넌트에 전달할 실제 이름
    } else {
      onSelect?.('기타')
    }
  }

  return (
    <div className={styles.container}>
      <WalletPayment
        isOpen={method === 'wallet'}
        onToggle={() => handleMethodChange('wallet')}
      />
      <CardSimplePayment
        isOpen={method === 'simple'}
        onToggle={() => handleMethodChange('simple')}
      />
      <GeneralCardPayment
        isOpen={method === 'general'}
        onToggle={() => handleMethodChange('general')}
      />
    </div>
  )
}

export default PaymentMethod
