import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '@/components/common/button/Button'
import TransferTicketInfo from '@/components/payment/refund/RefundTicketInfo'
import TransferFeeInfo from '@/components/payment/transfer/TransferFeeInfo'
import PaymentMethod from '@/components/payment/pay/PaymentMethod'
import ConfirmModal from '@/pages/payment/modal/AlertModal'
import PasswordInputModal from '@/pages/payment/modal/PasswordInputModal'

import { bookingTransfer } from '@/models/payment/BookingTransfer'
import { transferFee } from '@/models/payment/TransferFee'

import styles from '@pages/payment/transfer/TransferFeePaymentPage.module.css'

const TransferFeePaymentPage: React.FC = () => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [isAgreed, setIsAgreed] = useState<boolean>(false)

  const navigate = useNavigate()

  const handlePayment = () => {
    if (!selectedMethod || !isAgreed) return
    if (selectedMethod === '킷페이') {
      setIsConfirmModalOpen(true)
    }
    // TODO: 카드 간편결제, 일반 결제는 별도 처리
  }

  const handleConfirm = () => {
    setIsConfirmModalOpen(false)
    setIsPasswordModalOpen(true)
  }

  const handlePasswordComplete = (password: string) => {
    console.log('입력된 비밀번호:', password)
    setIsPasswordModalOpen(false)
    navigate('/payment/complete')
  }

  const handleCancel = () => {
    setIsConfirmModalOpen(false)
  }

  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.title}>양도 수수료 결제</h1>

        {/* 티켓 정보 */}
        <TransferTicketInfo
          title={bookingTransfer.product.title}
          date={bookingTransfer.product.datetime}
          ticket={bookingTransfer.product.ticket}
          sender={bookingTransfer.sender}
          receiver={bookingTransfer.receiver}
        />

        {/* 결제 수단 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>결제 수단</h2>
          <PaymentMethod selectedMethod={selectedMethod} onSelect={setSelectedMethod} />
        </section>

        {/* 수수료 정보 */}
        <section className={styles.feeSection}>
          <TransferFeeInfo
            perFee={transferFee.perFee}
            totalFee={transferFee.totalFee}
          />
        </section>

        {/* 약관 동의 */}
        <section className={styles.termsSection}>
          <label className={styles.checkboxWrapper}>
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
            />
            <span>
              (필수) 양도 서비스 이용약관 및 개인정보 수집 및 이용에 동의합니다.
            </span>
          </label>
        </section>

        {/* 결제 버튼 */}
        <div className={styles.buttonWrapper}>
          <Button
            className="w-full h-12"
            disabled={!selectedMethod || !isAgreed}
            onClick={handlePayment}
          >
            수수료 결제하기
          </Button>
        </div>
      </div>

      {/* 확인 모달 */}
      {isConfirmModalOpen && (
        <ConfirmModal
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      {/* 비밀번호 입력 모달 */}
      {isPasswordModalOpen && (
        <PasswordInputModal
          onComplete={handlePasswordComplete}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      )}
    </>
  )
}

export default TransferFeePaymentPage
