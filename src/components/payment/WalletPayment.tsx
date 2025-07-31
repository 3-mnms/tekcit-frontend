import React, { useState } from 'react';
import './WalletPayment.css';

const WalletPayment: React.FC = () => {
    const [selectedAccount] = useState<string>('NH농협 302******9411');
    const [amount] = useState<string>('20,000');
    const [paymentMethod, setPaymentMethod] = useState<string>(''); // 초기에는 선택 안됨

    return (
        <div className="wallet-payment-container">
            <div className="main-content">
                <div className="header">
                    <h2 className="title">결제수단</h2>
                </div>

                <div className="payment-section">
                    <div className="payment-header">
                        <div className="payment-logo">
                            <span className="money-text">머니 충전결제</span>
                        </div>
                    </div>

                    <div className="simple-payment-option">
                        <input
                            type="radio"
                            id="simple-payment"
                            name="payment-method"
                            className="radio-input"
                            checked={paymentMethod === 'account'}
                            onChange={() => setPaymentMethod('account')}
                        />
                        <label htmlFor="simple-payment" className="radio-label">계좌 간편결제</label>
                    </div>

                    <div className="charge-section">
                        <div className="charge-input-group">
                            <label className="charge-label">충전</label>
                            <div className="amount-selector">
                                <span className="amount">{amount}원</span>
                                <button
                                    className="dropdown-btn"
                                    onClick={() => {
                                        console.log('금액 선택 드롭다운 클릭');
                                    }}
                                >▼</button>
                            </div>
                        </div>

                        <div className="account-selector">
                            <span className="selected-account">{selectedAccount}</span>
                            <button className="dropdown-btn">▼</button>
                        </div>
                    </div>

                    {/* 추후 활성화 예정
          <button 
            className="payment-submit-btn"
            onClick={handlePaymentSubmit}
            disabled={isLoading}
          >
            {isLoading ? '처리중...' : '결제하기'}
          </button>
          */}
                </div>
            </div>
        </div>
    );
};

export default WalletPayment;
