import { useLocation, useNavigate } from 'react-router-dom'
import styles from './PaymentFailPage.module.css'
import Button from '@/components/common/button/Button'
import type { SimpleMethod, PaymentMethod } from '@/shared/types/payment'

const PaymentFailPage: React.FC = () => {
  const navigate = useNavigate()
  const { state } = useLocation() as {
    state?: { method?: PaymentMethod; simple?: SimpleMethod; txId?: string }
  }

  const goHome = () => navigate('/')
  const retry = () => navigate(-1) // 또는 원하는 재시작 경로: navigate('/reservation')

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>결제 실패</h2>
        <p className={styles.message}>죄송합니다. 결제가 완료되지 않았습니다.</p>

        {/* 선택: 실패 컨텍스트 표기 */}
        {state?.method && (
          <p className={styles.meta}>
            선택 수단: {state.method}
            {state?.simple ? ` (${state.simple})` : ''}
          </p>
        )}

        <div className={styles.buttonGroup}>
          <Button className="w-44 h-12 text-base font-semibold mr-7" onClick={goHome}>
            메인으로 가기
          </Button>
          <Button className="w-44 h-12 text-base font-semibold" onClick={retry}>
            다시 예매 하기
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PaymentFailPage
