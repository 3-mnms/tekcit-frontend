import styles from './PaymentFailPage.module.css'
import Button from '@/components/common/button/Button'

const PaymentCompletePage: React.FC = () => {
  const handleDetailClick = () => {
    // 예매 상세 페이지로 이동
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>결제 실패</h2>
        <div className={styles.buttonGroup}>
          <Button className="w-44 h-12 text-base font-semibold mr-7" onClick={handleDetailClick}>
            메인으로 가기
          </Button>
          <Button className="w-44 h-12 text-base font-semibold" onClick={handleDetailClick}>
            다시 예매 하기
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PaymentCompletePage
