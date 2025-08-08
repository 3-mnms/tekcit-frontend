import { useState } from 'react'
import CardSelectBox from '@/components/payment/pay/CardSelectBox'

import styles from './GeneralCardPayment.module.css'

interface GeneralCardPaymentProps {
  isOpen: boolean
  onToggle: () => void
}

const GeneralCardPayment: React.FC<GeneralCardPaymentProps> = ({
  isOpen,
  onToggle,
}) => {
  const [userType, setUserType] = useState<'personal' | 'corporate'>('personal')
  const [installment, setInstallment] = useState<string>('일시불')
  const [selectedCard, setSelectedCard] = useState<string>('')

  return (
    <div className={styles['general-card-payment-container']}>
      <div className={styles['payment-section']}>
        {/* ✅ 일반 결제 라디오 버튼 */}
        <label className={styles['simple-payment-option']}>
          <input
            type="radio"
            id="general-payment"
            name="payment-method"
            className={styles['radio-input']}
            checked={isOpen}
            onChange={onToggle}
          />
          <span className={styles['radio-custom']}></span>
          <span className={styles['radio-label']}>일반 결제</span>
        </label>

        {/* ✅ 슬라이드 영역 */}
        <div
          className={`${styles['general-payment-slide']} ${
            isOpen ? styles.open : ''
          }`}
        >
          <div className={styles['general-payment-section']}>
            <div className={styles['user-type-options']}>
              <label>
                <input
                  type="radio"
                  name="user-type"
                  value="personal"
                  checked={userType === 'personal'}
                  onChange={() => setUserType('personal')}
                />
                개인
              </label>
              <label>
                <input
                  type="radio"
                  name="user-type"
                  value="corporate"
                  checked={userType === 'corporate'}
                  onChange={() => setUserType('corporate')}
                />
                법인
              </label>
            </div>

            <CardSelectBox selectedCard={selectedCard} onSelect={setSelectedCard} />

            <select
              className={styles['dropdown-select']}
              value={installment}
              onChange={(e) => setInstallment(e.target.value)}
            >
              <option value="일시불">일시불</option>
              <option value="3개월">3개월</option>
              <option value="6개월">6개월</option>
              <option value="12개월">12개월</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GeneralCardPayment
