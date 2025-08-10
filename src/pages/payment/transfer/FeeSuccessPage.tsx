import { useNavigate, useLocation } from 'react-router-dom'
import styles from './FeeSuccessPage.module.css'
import Button from '@/components/common/button/Button'
import { FiCheck } from 'react-icons/fi'

const TransferFeeCompletePage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation() as { state?: { bookingId?: string } }

  const bookingId = location.state?.bookingId // 없으면 버튼에서 안전 경로로 이동 처리

  const goReservationDetail = () => {
    // 예약 상세 경로 규칙에 맞게 수정해서 사용
    if (bookingId) {
      navigate(`/my/reservations/${bookingId}`)
    } else {
      navigate('/my/reservations') // bookingId 없으면 목록으로
    }
  }

  const goHome = () => navigate('/')

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon} aria-hidden="true">
          <FiCheck />
        </div>
        <h2 className={styles.title}>수수료 결제가 완료되었어요</h2>
        <p className={styles.message}>
          양도 절차가 최종 확정되었습니다 <br />
          예매 상세에서 진행 상태를 확인할 수 있어요
        </p>

        <div className={styles.actions}>
          <Button className="w-44 h-12 font-semibold" onClick={goReservationDetail}>
            예매 상세 보기
          </Button>
          <Button className="w-40 h-11" onClick={goHome}>
            메인으로
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TransferFeeCompletePage
