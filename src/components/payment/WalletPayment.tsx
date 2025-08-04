import { useState } from 'react'
import '@components/payment/WalletPayment.css'

const WalletPayment: React.FC = () => {
  const [amount] = useState<string>('20,000')
  const [paymentMethod, setPaymentMethod] = useState<string>('') // 초기에는 선택 안됨

  return (
    <div className="wallet-payment-container">
      <div className="main-content">
        <div className="payment-section">
          <label className="simple-payment-option">
            <input
              type="radio"
              name="payment-method"
              className="radio-input"
              checked={paymentMethod === 'account'}
              onClick={() => setPaymentMethod((prev) => (prev === 'account' ? '' : 'account'))}
            />
            <span className="radio-custom"></span>
            <span className="radio-label">킷페이</span>
          </label>

          {/* 슬라이드 영역 */}
          <div className={`slide-toggle ${paymentMethod === 'account' ? 'open' : ''}`}>
            <div className="charge-section">
              <div className="charge-input-group">
                <label className="charge-label">충전</label>

                <div className="charge-options">
                  <div className="amount-selector">
                    <span className="amount">{amount}원</span>
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
