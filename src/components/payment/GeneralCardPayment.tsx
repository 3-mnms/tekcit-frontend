import { useState } from 'react'
import '@components/payment/GeneralCardPayment.css'
import CardSelectBox from '@/components/payment/CardSelectBox'

const GeneralCardPayment: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState<string>('') // ✅ 결제 방식 상태
  const [userType, setUserType] = useState<'personal' | 'corporate'>('personal')
  const [installment, setInstallment] = useState<string>('일시불')
  const [selectedCard, setSelectedCard] = useState<string>('')

  return (
    <div>
      <div>
        <div className="payment-section">
          {/* ✅ 일반 결제 라디오 버튼 */}
          <label className="simple-payment-option">
            <input
              type="radio"
              id="general-payment"
              name="payment-method"
              className="radio-input"
              checked={paymentMethod === 'general'}
              onClick={() => setPaymentMethod((prev) => (prev === 'general' ? '' : 'general'))}
            />
            <span className="radio-custom"></span>
            <span className="radio-label">일반 결제</span>
          </label>

          <div className={`general-payment-slide ${paymentMethod === 'general' ? 'open' : ''}`}>
            <div className="general-payment-section">
              <div className="user-type-options">
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
                className="dropdown-select"
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
    </div>
  )
}

export default GeneralCardPayment
