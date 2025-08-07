import { useState } from 'react'
import Button from '@/components/common/button/Button'
import TransferTicketInfo from '@/components/payment/transfer/TransferTicketInfo'
import TransferFeeInfo from '@/components/payment/transfer/TransferFeeInfo'
import ConfirmModal from '@pages/payment/ConfirmModal'

import { bookingTransfer } from '@/models/payment/BookingTransfer'
import { transferFee } from '@/models/payment/TransferFee'

import styles from '@pages/payment/TransferFeePaymentPage.module.css'

const TransferFeePaymentPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handlePayment = () => {
    setIsModalOpen(true)
  }

  const handleConfirm = () => {
    setIsModalOpen(false)
    console.log('결제 처리 로직 실행') // 실제 결제 API 호출
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.title}>양도 수수료 결제</h1>

        <TransferTicketInfo
          title={bookingTransfer.product.title}
          date={bookingTransfer.product.datetime}
          seat={bookingTransfer.product.seat.join(', ')}
          sender={bookingTransfer.sender}
          receiver={bookingTransfer.receiver}
        />
      </div>

      <div className={styles.feeSection}>
        <TransferFeeInfo
          perFee={transferFee.perFee}
          totalFee={transferFee.totalFee}
        />
      </div>

      <div className={styles.buttonWrapper}>
        <Button className="w-full h-12" onClick={handlePayment}>
          수수료 결제하기
        </Button>
      </div>

      {isModalOpen && (
        <ConfirmModal
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  )
}

export default TransferFeePaymentPage
