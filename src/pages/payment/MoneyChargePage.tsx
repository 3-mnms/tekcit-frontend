import { useState } from 'react'
import styles from './MoneyChargePage.module.css'
import Input from '@/components/common/input/Input'
import CardSimplePayment from '@/components/payment/pay/CardSimplePayment'

const MoneyChargePage: React.FC = () => {
  const [isCardOpen, setIsCardOpen] = useState(false)

  const handleCardToggle = () => {
    setIsCardOpen((prev) => !prev)
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>포인트 충전하기</h1>

        {/* 금액 입력 박스 */}
        <div className={styles.box}>
          <div className={styles.label}>포인트 충전 금액</div>
          <Input type="text" placeholder="금액 입력" />
        </div>

        {/* 결제 방식 박스 */}
        <div className={styles.box}>
          <CardSimplePayment isOpen={isCardOpen} onToggle={handleCardToggle} />
        </div>
      </div>
    </div>
  )
}

export default MoneyChargePage
