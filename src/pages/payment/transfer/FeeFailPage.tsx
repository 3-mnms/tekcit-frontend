import { useNavigate } from 'react-router-dom'
import { FiX } from 'react-icons/fi' // 실패 아이콘
import Button from '@/components/common/button/Button'
import styles from './FeeFailPage.module.css'

const TransferFeeFailPage: React.FC = () => {
  const navigate = useNavigate()

  const retryPayment = () => {
    // 재시도 시 결제 페이지로 이동
    navigate('/payment/transfer/fee')
  }

  const goHome = () => {
    navigate('/')
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon} aria-hidden="true">
          <FiX size={20} />
        </div>

        <h2 className={styles.title}>수수료 결제에 실패했어요</h2>
        <p className={styles.subtitle}>
          결제가 정상적으로 처리되지 않았습니다 <br />
          다시 시도하거나 다른 결제 수단을 선택해 주세요
        </p>

        <div className={styles.actions}>
          <Button className="w-44 h-11" onClick={retryPayment}>
            다시 결제하기
          </Button>
          <Button className="w-44 h-11" onClick={goHome}>
            메인으로
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TransferFeeFailPage
