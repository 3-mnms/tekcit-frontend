import { useState } from 'react'
import WalletPayment from '@components/payment/pay/WalletPayment'
import CardSimplePayment from '@components/payment/pay/CardSimplePayment'
import GeneralCardPayment from '@components/payment/pay/GeneralCardPayment'
import styles from '@components/payment/pay/PaymentMethod.module.css'

const PaymentMethod: React.FC = () => {
  const [method, setMethod] = useState<'wallet' | 'simple' | 'general'>('wallet')

  const handleMethodChange = (selected: typeof method) => {
    setMethod(selected)
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>결제 수단</h2>

      {/* ✅ 세 컴포넌트에 props로 상태 전달 */}
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
