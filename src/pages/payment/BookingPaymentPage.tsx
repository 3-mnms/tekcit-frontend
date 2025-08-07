import { useState } from 'react'
import WalletPayment from '@/components/payment/pay/WalletPayment'
import CardSimplePayment from '@/components/payment/pay/CardSimplePayment'
import GeneralCardPayment from '@/components/payment/pay/GeneralCardPayment'
import PaymentInfo from '@/components/payment/pay/PaymentInfo'
import Button from '@/components/common/button/Button'

import styles from '@pages/payment/BookingPaymentPage.module.css'

const BookingPaymentPage: React.FC = () => {
  const [openedMethod, setOpenedMethod] = useState<'wallet' | 'cardSimple' | 'general' | null>(null)

  return (
    <div className={styles['booking-container']}>
      
      <div className={styles['left-panel']}>

        <section className={styles['section']}>
          <h2 className={styles['section-title']}>결제 수단</h2>

          <div className={styles['payment-method-wrapper']}>
            <WalletPayment
              isOpen={openedMethod === 'wallet'}
              onToggle={() => setOpenedMethod(openedMethod === 'wallet' ? null : 'wallet')}
            />
            <CardSimplePayment
              isOpen={openedMethod === 'cardSimple'}
              onToggle={() => setOpenedMethod(openedMethod === 'cardSimple' ? null : 'cardSimple')}
            />
            <GeneralCardPayment
              isOpen={openedMethod === 'general'}
              onToggle={() => setOpenedMethod(openedMethod === 'general' ? null : 'general')}
            />
          </div>
        </section>
      </div>

      {/* 오른쪽: 공연 요약 + 결제 정보 + 결제 버튼 */}
      <div className={styles['right-panel']}>
        <div className={styles['payment-summary-wrapper']}>
          <PaymentInfo />
        </div>
        <div className={styles['pay-button-wrapper']}>
          <Button type="submit" className={styles['pay-button']}>
            결제하기
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BookingPaymentPage
