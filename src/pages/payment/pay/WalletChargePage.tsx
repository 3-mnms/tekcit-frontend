import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './WalletChargePage.module.css'
import Input from '@/components/common/input/Input'
import Button from '@/components/common/button/Button'
import CardSimplePayment from '@/components/payment/pay/CardSimplePayment'

const AMOUNT_PRESETS = [10000, 50000, 100000, 1000000] // 단위: 원

const WalletChargePage: React.FC = () => {
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<'네이버페이' | '카카오페이' | null>(null)
  const navigate = useNavigate()

  // 💡 금액 단위 버튼 클릭 시
  const handlePresetClick = (preset: number) => {
    const prev = parseInt(amount.replace(/[^0-9]/g, '')) || 0
    setAmount(String(prev + preset))
  }

  // 💡 금액 입력 (숫자만)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // input에서만 동작
    if (e.target instanceof HTMLInputElement) {
      const val = e.target.value.replace(/[^0-9]/g, '')
      setAmount(val)
    }
  }


  const handleCardSelect = (selected: '네이버페이' | '카카오페이') => setMethod(selected)

  const handleCharge = () => {
    if (!amount || !method) {
      alert('금액과 결제 수단을 선택해 주세요.')
      return
    }
    // 실제 결제/충전 로직 호출 후 완료 페이지 이동
    navigate('/payment/wallet-point/charge-complete', { state: { amount, method } })
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>포인트 충전하기</h1>

        {/* 💡 충전 금액 + 단위 버튼 */}
        <section className={styles.section}>
          <div className={styles.label}>포인트 충전 금액</div>
          <Input
            type="text"
            placeholder="금액 입력"
            value={amount}
            onChange={handleInputChange}
          />
          <div className={styles.presetGroup}>
            {AMOUNT_PRESETS.map(preset => (
              <button
                key={preset}
                type="button"
                className={styles.presetBtn}
                onClick={() => handlePresetClick(preset)}
              >
                +{preset >= 10000 ? `${preset / 10000}${preset % 10000 === 0 ? '만' : ''}` : preset}원
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.label}>간편결제</div>
          <div className={styles.paymentButtonGroup}>
            {/* 간편결제 버튼 여러 개 추가 가능 */}
            <CardSimplePayment compact onSelect={handleCardSelect} />
            {/* 예시: <TossSimplePayment />, <PaycoSimplePayment /> 등 추가 */}
          </div>
        </section>


        {/* 💡 충전하기 버튼 */}
        <Button
          className={styles.chargeBtn}
          onClick={handleCharge}
          disabled={!amount || !method}
        >
          충전하기
        </Button>
      </div>
    </div>
  )
}

export default WalletChargePage
