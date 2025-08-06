// src/pages/payment/TransferFeePaymentPage.tsx
import React from 'react'
import Button from '@/components/common/button/Button'
import TransferTicketInfo from '@/components/payment/transfer/TransferTicketInfo'
import TransferFeeInfo from '@/components/payment/transfer/TransferFeeInfo'
import { bookingTransfer } from '@/models/payment/BookingTransfer'
import { transferFee } from '@/models/payment/TransferFee'

import styles from '@/pages/payment/TransferFeePaymentPage.module.css'

const TransferFeePaymentPage: React.FC = () => {
  const handlePayment = () => {
    console.log('수수료 결제하기 클릭됨!')
  }

  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.title}>양도 수수료 결제</h1>

        {/* 공연/좌석/양도 정보 */}
        <TransferTicketInfo
          title={bookingTransfer.product.title}
          date={bookingTransfer.product.datetime}
          seat={bookingTransfer.product.seat.join(', ')}
          sender={bookingTransfer.sender}
          receiver={bookingTransfer.receiver}
        />
      </div>

      {/* 수수료 정보 */}
      <div className={styles.feeSection}>
        <TransferFeeInfo
          perFee={transferFee.perFee}
          totalFee={transferFee.totalFee}
        />
      </div>

      {/* 결제 버튼 */}
      <div className={styles.buttonWrapper}>
        <Button className="w-full h-12" onClick={handlePayment}>
          수수료 결제하기
        </Button>
      </div>

    </>
  )
}

export default TransferFeePaymentPage
