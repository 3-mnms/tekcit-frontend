import styles from '@components/payment/pay/WalletPayment.module.css'
import Button from '@components/common/button/Button'

interface WalletPaymentProps {
  isOpen: boolean
  onToggle: () => void
}

const WalletPayment: React.FC<WalletPaymentProps> = ({ isOpen, onToggle }) => {
  const amount = '20,000'

  const handleChargeClick = () => {
    alert('충전하기 버튼 클릭됨!')
  }

  return (
    <div className={styles['wallet-payment-container']}>
      <div className={styles['main-content']}>
        <div className={styles['payment-section']}>
          {/* ✅ 킷페이 + 충전하기 버튼 가로 정렬 */}
          <div className={styles['payment-header']}>
            <label className={styles['simple-payment-option']}>
              <input
                type="radio"
                name="payment-method"
                className={styles['radio-input']}
                checked={isOpen}
                onChange={onToggle}
              />
              <span className={styles['radio-custom']}></span>
              <span className={styles['radio-label']}>킷페이</span>
            </label>

            {/* ✅ 조건부로 충전하기 버튼 보여줌 */}
            {isOpen && <Button onClick={handleChargeClick}>충전하기</Button>}
          </div>

          {/* ✅ 슬라이드 영역 */}
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
