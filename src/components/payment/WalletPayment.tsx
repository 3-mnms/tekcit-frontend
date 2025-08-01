import { useState } from 'react';
import '@components/payment/WalletPayment.css';

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
                    <div className="simple-payment-option">
                        <input
                            type="radio"
                            id="simple-payment"
                            name="payment-method"
                            className="radio-input"
                            checked={paymentMethod === 'account'}
                            onChange={() => setPaymentMethod('account')}
                        />
                        <label htmlFor="simple-payment" className="radio-label">킷페이</label>
                    </div>

                    {/* 슬라이드 영역 */}
                    <div className={`slide-toggle ${paymentMethod === 'account' ? 'open' : ''}`}>
                        <div className="charge-section">
                            <div className="charge-input-group">
                                <label className="charge-label">충전</label>

                                <div className="charge-options">
                                    <div className="amount-selector">
                                        <span className="amount">{amount}원</span>
                                        <button className="dropdown-btn">▼</button>
                                    </div>

                                    <div className="account-selector">
                                        <span className="selected-account">{selectedAccount}</span>
                                        <button className="dropdown-btn">▼</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default WalletPayment;
