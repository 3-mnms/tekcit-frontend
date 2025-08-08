import styles from '@pages/payment/pay/PaymentCompletePage.module.css'
import Button from '@/components/common/button/Button'

const PaymentCompletePage: React.FC = () => {
  const handleDetailClick = () => {
    // 예매 상세 페이지로 이동
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>결제 성공</h2>
        <Button className="w-44 h-12 text-base font-semibold" onClick={handleDetailClick}>
          예매 상세 보기
        </Button>
      </div>
    </div>
  )
}

export default PaymentCompletePage
