import { useNavigate } from 'react-router-dom'
import { FiX } from 'react-icons/fi'
import Button from '@/components/common/button/Button'
import styles from './RefundFailPage.module.css'

const RefundFailPage: React.FC = () => {
  const navigate = useNavigate()

  const retry = () => navigate('/payment/refund') // 환불 진행 페이지로 재시도 멍
  const goHome = () => navigate('/')

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon} aria-hidden="true">
          <FiX size={20} />
        </div>

        <h2 className={styles.title}>환불 요청에 실패했어요</h2>
        <p className={styles.subtitle}>
          환불이 정상적으로 처리되지 않았습니다 멍 <br />
          잠시 후 다시 시도하거나 다른 결제/환불 수단을 선택해 주세요 멍
        </p>

        <div className={styles.actions}>
          <Button className="w-44 h-11" onClick={retry}>
            다시 시도하기
          </Button>
          <Button className="w-44 h-11" onClick={goHome}>
            메인으로
          </Button>
        </div>
      </div>
    </div>
  )
}

export default RefundFailPage
