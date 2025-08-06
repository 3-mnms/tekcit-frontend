// src/pages/payment/TransferPaymentPage.tsx

import AddressForm from '@/components/payment/address/AddressForm'
import PaymentMethod from '@components/payment/pay/PaymentMethod'
import BookingProductInfo from '@/components/payment/BookingProductInfo'
import TransferPaymentFooter from '@/components/payment/footer/TransferPaymentFooter' // ⬅ 추가
import Button from '@/components/common/button/Button'

import styles from './TransferPaymentPage.module.css'

const TransferPaymentPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>주문서</h1>

      {/* 1. 예매 상품 정보 영역 */}
      <section className={styles.productSection}>
        <h2 className={styles.sectionTitle}>예매 기본 안내사항</h2>
        <BookingProductInfo />
      </section>

      {/* 2. 배송지 입력 폼 */}
      <section className={styles.section}>
        <AddressForm />
      </section>

      {/* 3. 결제 수단 선택 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>결제 수단</h2>
        <PaymentMethod />
      </section>

      {/* 4. 결제 금액 요약 */}
      <section className={styles.priceSummary}>
        <div className={styles.priceRow}>
          <span>티켓 가격</span>
          <span>190,000원</span>
        </div>
        <div className={styles.priceTotal}>
          <strong>총 결제 금액</strong>
          <strong>190,000원</strong>
        </div>
      </section>

      {/* 5. 약관 동의 */}
      <TransferPaymentFooter /> {/* ⬅ 따로 분리된 컴포넌트로 대체 */}

      {/* 6. 결제 버튼 */}
      <Button className="w-full h-12 bg-blue-500 text-white text-lg font-bold rounded">
        다음
      </Button>
    </div>
  )
}

export default TransferPaymentPage
