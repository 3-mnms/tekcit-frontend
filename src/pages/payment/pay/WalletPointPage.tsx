import { useNavigate } from 'react-router-dom'
import styles from './WalletPointPage.module.css'
import Button from '@/components/common/button/Button'
import PayHistoryTable from '@/components/payment/pay/WalletHistory'

const WalletPointPage: React.FC = () => {
  const navigate = useNavigate()

  // 충전 버튼 클릭 시 페이지 이동
  const handleChargeClick = () => {
    navigate('/payment/wallet-point/money-charge')
  }

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
              <span className={styles.amount}>5,000원</span>
              <Button className="w-[190px] h-10">환불</Button>
            </div>
          </div>
        </div>
      </div>

      <h2 className={styles.subtitle}>이용내역</h2>
      <PayHistoryTable />
    </div>
  )
}

export default WalletPointPage
