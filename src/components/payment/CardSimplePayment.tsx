import { useState } from 'react'
import '@components/payment/CardSimplePayment.css'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  disabled?: boolean
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
}) => {
  return (
    <button
      className={`custom-button ${className} ${disabled ? 'disabled' : ''}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

const CardSimplePayment: React.FC = () => {
  const [isCardPaymentEnabled, setIsCardPaymentEnabled] = useState(false)

  const handleToggle = () => {
    setIsCardPaymentEnabled(!isCardPaymentEnabled)
  }

  const handlePayment = (method: string) => {
    alert(`${method}로 결제를 진행합니다.`)
  }

  return (
    <div className="white-box">
      {/* 카드 간편 결제 토글 */}
      <div className="toggle-section">
        <div className="toggle-row" onClick={handleToggle}>
          <div className="toggle-radio">
            <input
              type="radio"
              checked={isCardPaymentEnabled}
              onChange={handleToggle}
              className="radio-input"
            />
            <span className="radio-custom"></span>
          </div>
          <span className="toggle-label">카드 간편 결제</span>
        </div>
      </div>

      {/* 슬라이드 애니메이션이 적용된 영역 */}
      <div className={`slide-toggle ${isCardPaymentEnabled ? 'open' : ''}`}>
        <div className="payment-box">
          <div className="payment-buttons-row">
            <Button className="payment-btn naver-btn" onClick={() => handlePayment('네이버페이')}>
              <div className="btn-icon naver-icon">
                <span className="icon-text">N</span>
              </div>
              <span className="btn-text">네이버페이</span>
            </Button>

            <Button className="payment-btn kakao-btn" onClick={() => handlePayment('카카오페이')}>
              <div className="btn-icon kakao-icon">
                <span className="icon-text">K</span>
              </div>
              <span className="btn-text">카카오페이</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardSimplePayment
