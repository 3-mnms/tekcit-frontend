import React, { useState } from 'react'
import Button from '@/components/common/button/Button'
import styles from './PayPointPage.module.css'
import PayHistoryTable from '@/components/payment/PayHistoryTable'
import MoneyChargeModal from '@/pages/payment/MoneyChargeMordal' // ✅ 모달 import

const PayPointPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>페이 포인트 충전</h1>

        <div className={styles.moneySection}>
          <div className={styles.moneyGroup}>
            <div className={styles.moneyBlock}>
              <span className={styles.label}>페이 머니</span>
              <Button className="w-[190px] h-10" onClick={handleOpenModal}>
                충전
              </Button>
            </div>

            <div className={styles.moneyBlock}>
              <span className={styles.amount}>5,000원</span>
              <Button className="w-[190px] h-10">환불</Button>
            </div>
          </div>
        </div>
      </div>

      <h2 className={styles.subtitle}>이용내역</h2>
      <PayHistoryTable />

      {/* ✅ 모달 렌더링 조건부 처리 */}
      {isModalOpen && <MoneyChargeModal onClose={handleCloseModal} />}
    </div>
  )
}

export default PayPointPage
