import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import WalletPayment from '@/components/payment/pay/WalletPayment'
import CardSimplePayment from '@/components/payment/pay/CardSimplePayment'
import GeneralCardPayment from '@/components/payment/pay/GeneralCardPayment'
import PaymentInfo from '@/components/payment/pay/PaymentInfo'
import Button from '@/components/common/button/Button'
import PasswordInputModal from '@/pages/payment/modal/PasswordInputModal'

import styles from '@pages/payment/BookingPaymentPage.module.css'

const BookingPaymentPage: React.FC = () => {
  const navigate = useNavigate()

  const [openedMethod, setOpenedMethod] = useState<'wallet' | 'cardSimple' | 'general' | null>(null)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

  const handlePayment = () => {
    if (openedMethod === 'wallet') {
      setIsPasswordModalOpen(true)
    } else {
      // TODO: 다른 결제 수단 처리
      console.log('카드 결제 로직')
    }
  }

  return (
    <div className={styles['booking-container']}>
      {/* 왼쪽: 결제 수단 */}
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

      {/* 오른쪽: 결제 정보 */}
      <div className={styles['right-panel']}>
        <div className={styles['payment-summary-wrapper']}>
          <PaymentInfo />
        </div>
        <div className={styles['pay-button-wrapper']}>
          <Button type="button" className={styles['pay-button']} onClick={handlePayment}>
            결제하기
          </Button>
        </div>
      </div>

      {/* 비밀번호 입력 모달 */}
      {isPasswordModalOpen && (
        <PasswordInputModal
          onClose={() => setIsPasswordModalOpen(false)}
          onComplete={(pw) => {
            console.log('입력된 비밀번호:', pw)
            setIsPasswordModalOpen(false)

            // ✅ 결제 완료 페이지로 이동
            navigate('/payment/complete')
          }}
        />

      )}
    </div>
  )
}

export default BookingPaymentPage
