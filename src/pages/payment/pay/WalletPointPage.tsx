import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '@/components/common/button/Button'
import WalletHistory from '@/components/payment/pay/WalletHistory'
import { getWalletBalance } from '@/shared/api/payment/wallet'

import styles from './WalletPointPage.module.css'

const WalletPointPage: React.FC = () => {
  const navigate = useNavigate()

  // 충전 버튼 클릭 시 페이지 이동
  const handleChargeClick = () => {
    navigate('/payment/wallet-point/money-charge')
  }

  const [balance, setBalance] = useState(0)
  useEffect(() => {
    const sync = async () => setBalance(await getWalletBalance())
    sync()
    window.addEventListener('focus', sync)
    document.addEventListener('visibilitychange', sync)
    return () => {
      window.removeEventListener('focus', sync)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>페이 포인트 충전</h1>

        <div className={styles.moneySection}>
          <div className={styles.moneyGroup}>
            <div className={styles.moneyBlock}>
              <span className={styles.label}>페이 머니</span>
              <Button className="w-[190px] h-10" onClick={handleChargeClick}>
                충전
              </Button>
            </div>
            <div className={styles.moneyBlock}>
              <span className={styles.amount}>{balance.toLocaleString()}원</span>
              <Button className="w-[190px] h-10">환불</Button>
            </div>
          </div>
        </div>
      </div>

      <h2 className={styles.subtitle}>이용내역</h2>
      <WalletHistory />
    </div>
  )
}

export default WalletPointPage
