import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import styles from './WalletChargePage.module.css'

import Input from '@/components/common/input/Input'
import Button from '@/components/common/button/Button'
import CardSimplePayment, { type SimpleMethod } from '@/components/payment/pay/CardSimplePayment'

const AMOUNT_PRESETS = [10000, 50000, 100000, 1000000] // 단위: 원

const WalletChargePage: React.FC = () => {
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<SimpleMethod | null>(null) // ✅ 타입 넓힘
  const navigate = useNavigate()

  const handlePresetClick = (preset: number) => {
    const prev = parseInt(amount.replace(/[^0-9]/g, '')) || 0
    setAmount(String(prev + preset))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target instanceof HTMLInputElement) {
      const val = e.target.value.replace(/[^0-9]/g, '')
      setAmount(val)
    }
  }

  const handleCardSelect = (selected: SimpleMethod) => {
    // ✅ 타입 넓힘
    setMethod(selected)
  }

  const handleCharge = () => {
    if (!amount || !method) {
      alert('금액과 결제 수단을 선택해 주세요.')
      return
    }
    const txId = String(Date.now())
    navigate('/payment/wallet-point/charge-success', { state: { amount, method, txId } })
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>포인트 충전하기</h1>

        <section className={styles.section}>
          <div className={styles.label}>포인트 충전 금액</div>
          <Input type="text" placeholder="금액 입력" value={amount} onChange={handleInputChange} />
          <div className={styles.presetGroup}>
            {AMOUNT_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={styles.presetBtn}
                onClick={() => handlePresetClick(preset)}
              >
                +{preset >= 10000 ? `${preset / 10000}${preset % 10000 === 0 ? '만' : ''}` : preset}
                원
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.label}>간편결제</div>
          <div className={styles.paymentButtonGroup}>
            <CardSimplePayment compact onSelect={handleCardSelect} />
          </div>
        </section>

        <Button className={styles.chargeBtn} onClick={handleCharge} disabled={!amount || !method}>
          충전하기
        </Button>
      </div>
    </div>
  )
}

export default WalletChargePage
