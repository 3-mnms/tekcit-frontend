import { useNavigate } from 'react-router-dom'
import Button from '@/components/common/button/Button'
import styles from './RefundSuccessPage.module.css'

const RefundSuccessPage: React.FC = () => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>예매 취소 성공</h1>
        <div className={styles.info}>
          <div className={styles.desc}>예매 취소가 정상적으로 완료되었습니다.</div>
          <div className={styles.amountBox}>
            <span className={styles.label}>환불 금액</span>
            <span className={styles.amount}>100,000원</span>
          </div>
        </div>
        <Button className={styles.button} onClick={handleGoHome}>
          홈으로 가기
        </Button>
      </div>
    </div>
  )
}

export default RefundSuccessPage
