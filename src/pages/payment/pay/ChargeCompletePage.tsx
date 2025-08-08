import { useLocation, useNavigate } from 'react-router-dom'
import Button from '@/components/common/button/Button'
import styles from './ChargeCompletePage.module.css'

const ChargeCompletePage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { amount, method } = location.state || {}

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>충전이 완료되었습니다!</h2>
        <div className={styles.info}>
          <div>
            <span className={styles.label}>충전 금액</span>
            <span className={styles.value}>{amount ? `${Number(amount).toLocaleString()}원` : '-'}</span>
          </div>
          <div>
            <span className={styles.label}>결제수단</span>
            <span className={styles.value}>{method || '-'}</span>
          </div>
        </div>
        <Button className={styles.btn} onClick={() => navigate('/payment/wallet-point')}>
          내역 보기
        </Button>
      </div>
    </div>
  )
}

export default ChargeCompletePage
