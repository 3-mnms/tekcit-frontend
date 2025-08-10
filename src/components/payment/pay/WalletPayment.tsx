import { useNavigate } from 'react-router-dom'
import Button from '@components/common/button/Button'
import styles from './WalletPayment.module.css'

interface WalletPaymentProps {
  isOpen: boolean
  onToggle: () => void
}

const WalletPayment: React.FC<WalletPaymentProps> = ({ isOpen, onToggle }) => {
  const amount = '20,000'
  const navigate = useNavigate()

  const handleChargeClick = () => {
    navigate('/payment/wallet-point/money-charge')
  }

  return (
    <div className={styles['wallet-payment-container']}>
      <div className={styles['main-content']}>
        <div className={styles['payment-section']}>
          {/* 헤더: 일반 결제와 동일한 라디오 마크업 멍 */}
          <div className={styles['payment-header']}>
            <label className={styles['simple-payment-option']}>
              <input
                type="radio"
                name="payment-method"
                checked={isOpen}
                onChange={onToggle}
                aria-label="킷페이 결제 선택"
              />
              <span className={styles['radio-label']}>킷페이</span>
            </label>

            {/* 조건부로 충전 버튼 표시 멍 */}
            {isOpen && <Button onClick={handleChargeClick}>충전하기</Button>}
          </div>

          {/* 슬라이드 영역 멍 */}
          <div className={`${styles['slide-toggle']} ${isOpen ? styles['open'] : ''}`}>
            <div className={styles['charge-section']}>
              <div className={styles['charge-input-group']}>
                <label className={styles['charge-label']}>충전</label>
                <div className={styles['charge-options']}>
                  <div className={styles['amount-selector']}>
                    <span className={styles['amount']}>{amount}원</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalletPayment
