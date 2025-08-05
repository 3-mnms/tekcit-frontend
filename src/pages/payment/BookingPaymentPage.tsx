import { useState } from 'react' // ✅ useState import
import AddressForm from '@/components/payment/AddressForm'
import WalletPayment from '@/components/payment/WalletPayment'
import CardSimplePayment from '@/components/payment/CardSimplePayment'
import GeneralCardPayment from '@/components/payment/GeneralCardPayment'
import PaymentInfo from '@/components/payment/PaymentInfo'
import Button from '@/components/common/button/Button'

import '@pages/payment/BookingPaymentPage.css'

const BookingPaymentPage: React.FC = () => {
  // ✅ 슬라이드 열림 상태 관리 (하나만 열리도록)
  const [openedMethod, setOpenedMethod] = useState<'wallet' | 'cardSimple' | 'general' | null>(null)

  return (
    <div className="booking-container">
      
      {/* 왼쪽: 배송지 + 결제 수단 */}
      <div className="left-panel">
        <section className="section">
          <h2 className="section-title">배송지 정보</h2>
          <AddressForm />
        </section>

        <section className="section">
          <h2 className="section-title">결제 수단</h2>

          <div className="payment-method-wrapper">
            <WalletPayment
              isOpen={openedMethod === 'wallet'}
              onToggle={() =>
                setOpenedMethod(openedMethod === 'wallet' ? null : 'wallet')
              }
            />
            <CardSimplePayment
              isOpen={openedMethod === 'cardSimple'}
              onToggle={() =>
                setOpenedMethod(openedMethod === 'cardSimple' ? null : 'cardSimple')
              }
            />
            <GeneralCardPayment
              isOpen={openedMethod === 'general'}
              onToggle={() =>
                setOpenedMethod(openedMethod === 'general' ? null : 'general')
              }
            />
          </div>
        </section>
      </div>

      {/* 오른쪽: 공연 요약 + 결제 정보 + 결제 버튼 */}
      <div className="right-panel">
        <div className="payment-summary-wrapper">
          <PaymentInfo />
        </div>
        <div className="pay-button-wrapper">
          <Button type="submit" className="pay-button">
            결제하기
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BookingPaymentPage
