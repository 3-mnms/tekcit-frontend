import { useLocation, useNavigate } from 'react-router-dom'
import styles from './PaymentSuccessPage.module.css'
import Button from '@/components/common/button/Button'
import type { SimpleMethod, PaymentMethod } from '@/shared/types/payment'

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate()
  const { state } = useLocation() as {
    state?: { method?: PaymentMethod; simple?: SimpleMethod; txId?: string }
  }

  const handleDetailClick = () => {
    // 예매 상세 페이지 경로로 변경하세요
    navigate('/booking/detail')
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>결제 성공</h2>

        {/* 선택: 거래번호/수단 표시 */}
        {state?.txId && <p className={styles.message}>거래번호: {state.txId}</p>}
        {state?.method === 'cardSimple' && state?.simple && (
          <p className={styles.message}>간편결제: {state.simple}</p>
        )}

        <div className={styles.actions}>
          <Button className="w-44 h-12 text-base font-semibold" onClick={handleDetailClick}>
            예매 상세 보기
          </Button>
          <Button className="w-44 h-12 text-base font-semibold" onClick={() => navigate('/')}>
            홈으로
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccessPage
