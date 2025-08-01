// CardPaymentUI.tsx
import React, { useState } from 'react';
import '@components/payment/CardSimplePayment.css'; // CSS 파일 import

// 기존 Button 컴포넌트 (CSS Module 사용)
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
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
  );
};

// 카드 간편 결제 컴포넌트
const CardPaymentUI: React.FC = () => {
  const [isCardPaymentEnabled, setIsCardPaymentEnabled] = useState(false);

  const handleToggle = () => {
    setIsCardPaymentEnabled(!isCardPaymentEnabled);
  };

  const handlePayment = (method: string) => {
    alert(`${method}로 결제를 진행합니다.`);
  };

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

      {/* 결제 방법 박스 - 토글이 켜져있을 때만 표시 */}
      {isCardPaymentEnabled && (
        <div className="payment-box">

          {/* 결제 버튼들 */}
          <div className="payment-buttons-row">
            {/* 네이버페이 버튼 */}
            <Button
              className="payment-btn naver-btn"
              onClick={() => handlePayment('네이버페이')}
            >
              <div className="btn-icon naver-icon">
                <span className="icon-text">N</span>
              </div>
              <span className="btn-text">네이버페이</span>
            </Button>

            {/* 카카오페이 버튼 */}
            <Button
              className="payment-btn kakao-btn"
              onClick={() => handlePayment('카카오페이')}
            >
              <div className="btn-icon kakao-icon">
                <span className="icon-text">K</span>
              </div>
              <span className="btn-text">카카오페이</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardPaymentUI;