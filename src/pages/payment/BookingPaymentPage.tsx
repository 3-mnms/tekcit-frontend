import AddressForm from '@/components/payment/AddressForm'
import WalletPayment from '@/components/payment/WalletPayment'
import CardSimplePayment from '@/components/payment/CardSimplePayment'
import GeneralCardPayment from '@/components/payment/GeneralCardPayment'
import PaymentInfo from '@/components/payment/PaymentInfo'
import Button from '@/components/common/button/Button' // 재사용 버튼

import '@pages/payment/BookingPaymentPage.css' // 스타일은 따로 관리

const BookingPaymentPage: React.FC = () => {
  return (
    <div className="booking-container">
      {/* 왼쪽: 배송지 + 결제수단 */}
      <div className="left-panel">
        <section className="section">
          <h2 className="section-title">배송지 정보</h2>
          <AddressForm />
        </section>

        <section className="section">
          <h2 className="section-title">결제 수단</h2>

          <div>
            <WalletPayment />
            <CardSimplePayment />
            <GeneralCardPayment />
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
