import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import AddressForm from '@/components/payment/address/AddressForm'
import PaymentMethod from '@/components/payment/pay/PaymentMethod'
import BookingProductInfo from '@/components/payment/BookingProductInfo'
import Button from '@/components/common/button/Button'
import PasswordInputModal from '@/pages/payment/modal/PasswordInputModal'
import AlertModal from '@/pages/payment/modal/AlertModal'

import styles from './TransferPaymentPage.module.css'

const TransferPaymentPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [isAddressFilled, setIsAddressFilled] = useState<boolean>(false)
  const [isAgreed, setIsAgreed] = useState<boolean>(false)

  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [pendingMethod, setPendingMethod] = useState<string>('')

  const navigate = useNavigate()

  // 기존 버튼 클릭 → Alert 띄우기만!
  const handleNextClick = () => {
    setPendingMethod(selectedMethod)
    setIsAlertOpen(true)
  }

  // AlertModal에서 확인
  const handleAlertConfirm = () => {
    setIsAlertOpen(false)
    if (pendingMethod === '킷페이') {
      setIsModalOpen(true)
    } else {
      navigate('/payment/transfer/transfer-success') // ← 일반/간편 결제는 즉시 완료 페이지로 이동
    }
    setPendingMethod('') // ← 다음 시도 대비 초기화
  }

  // AlertModal에서 취소
  const handleAlertCancel = () => {
    setIsAlertOpen(false)
    setPendingMethod('') // ← 취소 시에도 초기화
  }

  // 킷페이(비밀번호 입력 완료 시)
  const handlePasswordComplete = (password: string) => {
    console.log('입력된 비밀번호:', password)
    setIsModalOpen(false)
    navigate('/payment/transfer/transfer-success')
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>양도 주문서</h1>

      {/* 예매 정보 */}
      <section className={styles.productSection}>
        <h2 className={styles.sectionTitle}>예매 기본 안내사항</h2>
        <BookingProductInfo />
      </section>

      {/* 배송지 입력 */}
      <section className={styles.section}>
        <AddressForm onValidChange={setIsAddressFilled} />
      </section>

      {/* 결제 수단 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>결제 수단</h2>
        <PaymentMethod onSelect={setSelectedMethod} />
      </section>

      {/* 결제 요약 */}
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

      {/* 약관 동의 */}
      <section className={styles.section}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
          />
          <span className={styles.checkboxText}>
            (필수) 양도 서비스 이용약관 및 개인정보 수집 및 이용에 동의합니다.
          </span>
        </label>
      </section>

      {/* 다음 버튼 */}
      <Button
        onClick={handleNextClick}
        disabled={!(isAddressFilled && selectedMethod && isAgreed)}
        className="w-full h-12 bg-blue-500 text-white text-lg font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        다음
      </Button>

      {/* AlertModal */}
      {isAlertOpen && (
        <AlertModal title="결제 안내" onCancel={handleAlertCancel} onConfirm={handleAlertConfirm}>
          양도로 구매한 티켓은 환불 불가합니다. 결제 하시겠습니까?
        </AlertModal>
      )}

      {/* 비밀번호 입력 모달 */}
      {isModalOpen && (
        <PasswordInputModal
          onClose={() => setIsModalOpen(false)}
          onComplete={handlePasswordComplete}
        />
      )}
    </div>
  )
}

export default TransferPaymentPage
