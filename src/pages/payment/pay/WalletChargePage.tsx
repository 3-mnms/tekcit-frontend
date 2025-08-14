// src/pages/payment/wallet/WalletChargePage.tsx
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import styles from './WalletChargePage.module.css'

import Input from '@/components/common/input/Input'
import Button from '@/components/common/button/Button'
import TossPayment, { type TossPaymentHandle } from '@/components/payment/pay/TossPayment'

const AMOUNT_PRESETS = [10000, 50000, 100000, 1000000] // 단위: 원

const WalletChargePage: React.FC = () => {
  const [amount, setAmount] = useState('')
  const navigate = useNavigate()
  const tossRef = useRef<TossPaymentHandle>(null)

  const amountNumber = parseInt((amount || '').replace(/[^0-9]/g, ''), 10) || 0
  const orderName = '지갑 포인트 충전'

  const handlePresetClick = (preset: number) => {
    const prev = parseInt((amount || '').replace(/[^0-9]/g, ''), 10) || 0
    setAmount(String(prev + preset))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target instanceof HTMLInputElement) {
      const val = e.target.value.replace(/[^0-9]/g, '')
      setAmount(val)
    }
  }

  const handleCharge = async () => {
    if (!amountNumber) {
      alert('충전 금액을 입력해 주세요.')
      return
    }

    // 결제 요청(리다이렉트 발생)
    await tossRef.current?.requestPay()
    // 리다이렉트가 일어나므로 아래 navigate는 실행되지 않을 수 있음(보호용)
    navigate('/payment/wallet-point/charge-success', { replace: true })
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

        {/* 토스 페이먼츠(PortOne) 결제 수단 — 단일 수단이라 항상 open */}
        <section className={styles.section}>
          <TossPayment
            ref={tossRef}
            isOpen={true}
            onToggle={() => {}}
            amount={amountNumber}
            orderName={orderName}
            redirectUrl={`${window.location.origin}/payment/wallet-point/charge-success?amount=${encodeURIComponent(
              String(amountNumber)
            )}`}
          />
        </section>

        <Button className={styles.chargeBtn} onClick={handleCharge} disabled={!amountNumber}>
          충전하기
        </Button>
      </div>
    </div>
  )
}

export default WalletChargePage
