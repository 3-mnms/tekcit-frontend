import { useMemo, useRef, useState } from 'react'
import styles from '@pages/payment/modal/MoneyChargeModal.module.css'
import Input from '@/components/common/input/Input'
import TossPayment, { type TossPaymentHandle } from '@/components/payment/pay/TossPayment'

interface MoneyChargePageProps {
  onClose: () => void
}

const MoneyChargePage: React.FC<MoneyChargePageProps> = ({ onClose }) => {
  const [amountInput, setAmountInput] = useState<string>('')

  const [isTossOpen, setIsTossOpen] = useState<boolean>(true)
  const tossRef = useRef<TossPaymentHandle>(null)

  const amount = useMemo(() => {
    const onlyDigits = amountInput.replace(/[^\d]/g, '')
    return onlyDigits ? Number(onlyDigits) : 0
  }, [amountInput])

  // ✅ 타입을 유니온으로 넓히고 currentTarget.value 사용
  const handleAmountChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = (e) => {
    setAmountInput(e.currentTarget.value)
  }

  const handleTossToggle = () => setIsTossOpen((prev) => !prev)

  // ✅ 누락된 결제 실행 핸들러 추가
  const handleCharge = async () => {
    if (!amount || amount < 100) {
      alert('충전 금액을 100원 이상 입력해 주세요.')
      return
    }
    await tossRef.current?.requestPay()
    // 성공/실패 처리는 redirectUrl 페이지에서 처리
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <button className={styles.closeButton} onClick={onClose}>✕</button>

          <h1 className={styles.title}>포인트 충전하기</h1>

          <div className={styles.box}>
            <div className={styles.label}>포인트 충전 금액</div>
            <Input
              type="text"
              placeholder="금액 입력 (예: 10000)"
              value={amountInput}
              onChange={handleAmountChange}  // ✅ 타입 일치
            />
            <div className={styles.helperText}>
              입력한 금액: {amount.toLocaleString()}원
            </div>
          </div>

          <div className={styles.box}>
            <TossPayment
              ref={tossRef}
              isOpen={isTossOpen}
              onToggle={handleTossToggle}
              amount={amount}
              orderName={`페이 포인트 충전 ${amount.toLocaleString()}원`}
              redirectUrl={`${window.location.origin}/payment/wallet-point/charge-success`}
            />
          </div>

          <div className={styles.actions}>
            <button
              className={styles.primaryButton}
              onClick={handleCharge}
              disabled={amount <= 0}
            >
              충전 결제하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MoneyChargePage
