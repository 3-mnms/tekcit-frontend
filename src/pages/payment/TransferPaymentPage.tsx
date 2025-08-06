import AddressForm from '@/components/payment/address/AddressForm'
import PaymentMethod from '@components/payment/pay/PaymentMethod'
import Button from '@/components/common/button/Button'
import BookingProductInfo from '@/components/payment/BookingProductInfo'

import styles from "@components/payment/address/AddressForm.module.css";

const TransferPaymentPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>주문서</h1>

      {/* 1. 예매 상품 정보 영역 */}
      <BookingProductInfo /> {/* ✅ 컴포넌트로 교체 멍 */}

      {/* 2. 배송지 입력 폼 */}
      <section className={styles.section}>
        <AddressForm />
      </section>

      {/* 3. 결제 수단 선택 */}
      <section className={styles.section}>
        <PaymentMethod />
      </section>

      {/* 4. 결제 금액 요약 */}
      <section className={styles.priceSummary}>
        <div className={styles.priceRow}>
          <span>상품 금액</span>
          <span>190,000원</span>
        </div>
        <div className={styles.priceRow}>
          <span>수수료</span>
          <span>0원</span>
        </div>
        <div className={styles.priceTotal}>
          <strong>총 결제 금액</strong>
          <strong>190,000원</strong>
        </div>
      </section>

      {/* 5. 약관 동의 및 결제 버튼 */}
      <section className={styles.terms}>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" required />
          <span className={styles.checkboxText}>
            (필수) 양도 서비스 이용약관 및 개인정보 수집 및 이용 동의
          </span>
        </label>

        <Button className="w-full h-12 bg-blue-500 text-white text-lg font-bold rounded">
          다음
        </Button>
      </section>
    </div>
  )
}

export default TransferPaymentPage
