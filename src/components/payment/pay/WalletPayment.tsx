import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@components/common/button/Button'
import styles from './WalletPayment.module.css'
import { getWalletBalance } from '@/shared/api/payment/wallet'

interface WalletPaymentProps {
  isOpen: boolean
  onToggle: () => void
  dueAmount?: number
}

const WalletPayment: React.FC<WalletPaymentProps> = ({ isOpen, dueAmount = 0 }) => {
  const navigate = useNavigate()
  const [balance, setBalance] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sync = async () => {
    try {
      setError(null)
      const v = await getWalletBalance()
      setBalance(v)
    } catch {
      setError('잔액을 불러오지 못했어요')
    }
  }

  useEffect(() => {
    sync()
    const onFocus = () => sync()
    const onVisible = () => document.visibilityState === 'visible' && sync()
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  useEffect(() => { if (isOpen) sync() }, [isOpen])

  const shortage = useMemo(() => Math.max(0, dueAmount - (balance ?? 0)), [dueAmount, balance])

  return (
    <div className={styles.card}>

      {/* 바디: 여백 넓게 + 3줄만 */}
      <div className={`${styles.body} ${isOpen ? styles.open : ''}`}>
        {error && <p className={styles.error}>{error}</p>}
        {balance === null && !error && <p className={styles.muted}>잔액을 불러오는 중…</p>}

        {balance !== null && (
          <>
            <div className={styles.row}>
              <span className={styles.label}>잔액</span>
              <span className={styles.value}>{balance.toLocaleString()}원</span>
            </div>

            {shortage > 0 && (
              <div className={styles.shortageWarning}>
                <span className={styles.warningIcon}>⚠</span>
                결제를 진행하려면 <strong>{shortage.toLocaleString()}원</strong>이 더 필요합니다.
              </div>
            )}

            {shortage > 0 && (
              <div className={styles.actions}>
                <Button className={styles.chargeBtn} onClick={() => navigate('/payment/wallet-point/money-charge')}>
                  충전하기
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default WalletPayment
