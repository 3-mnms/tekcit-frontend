import { useNavigate } from 'react-router-dom' // ✅ 추가 멍!
import styles from '@/pages/payment/pay/PaymentCompletePage.module.css'
import Button from '@/components/common/button/Button'

const TransferSuccessPage: React.FC = () => {
  const navigate = useNavigate() // ✅ 추가 멍!

  const handleDetailClick = () => {
    navigate('/payment/transfer-fee') // ✅ 여기서 페이지 이동 멍!
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>결제 성공</h2>
        <p className={styles.message}>수수료 결제를 완료해야 양도가 최종 확정됩니다</p>
        <Button className="w-44 h-12 text-base font-semibold" onClick={handleDetailClick}>
          수수료 결제하기
        </Button>
      </div>
    </div>
  )
}

export default TransferSuccessPage
