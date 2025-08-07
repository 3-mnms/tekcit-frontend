// MoneyChargePage.tsx

import React, { useState } from 'react'
import styles from '@pages/payment/MoneyChargeMordal.module.css'
import Input from '@/components/common/input/Input'
import CardSimplePayment from '@/components/payment/pay/CardSimplePayment'

interface MoneyChargePageProps {
  onClose: () => void
}

const MoneyChargePage: React.FC<MoneyChargePageProps> = ({ onClose }) => {
  const [isCardOpen, setIsCardOpen] = useState(false)

  const handleCardToggle = () => {
    setIsCardOpen((prev) => !prev)
  }

  return (
    <div className={styles.overlay}>
      {' '}
      {/* ✅ overlay 추가 */}
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>

          <h1 className={styles.title}>포인트 충전하기</h1>

          <div className={styles.box}>
            <div className={styles.label}>포인트 충전 금액</div>
            <Input type="text" placeholder="금액 입력" />
          </div>

          <div className={styles.box}>
            <CardSimplePayment isOpen={isCardOpen} onToggle={handleCardToggle} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MoneyChargePage
