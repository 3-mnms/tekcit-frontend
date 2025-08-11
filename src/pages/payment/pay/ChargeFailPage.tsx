import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiX } from 'react-icons/fi'
import Button from '@/components/common/button/Button'
import styles from './ChargeFailPage.module.css'

type Method = '네이버페이' | '카카오페이'

const ChargeFailPage: React.FC = () => {
  const { state } = useLocation() as {
    state?: { amount?: string | number; method?: Method; txId?: string; message?: string }
  }
  const navigate = useNavigate()

  const amount = useMemo(() => {
    const a = state?.amount
    const n = typeof a === 'string' ? Number(a) : (a ?? 0)
    return Number.isFinite(n) ? n : 0
  }, [state?.amount])

  const method = state?.method ?? '-'
  const reason =
    state?.message ||
    new URLSearchParams(window.location.search).get('reason') ||
    '일시적인 오류로 충전에 실패했습니다'

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon} aria-hidden="true">
          <FiX size={20} />
        </div>

        <h2 className={styles.title}>충전에 실패했어요</h2>
        <p className={styles.subtitle}>
          {reason} 멍 <br />
          잠시 후 다시 시도하거나 다른 결제 수단을 선택해 주세요 멍
        </p>

        <div className={styles.infoBox}>
          <div className={styles.row}>
            <span className={styles.label}>시도 금액</span>
            <span className={styles.value}>{amount ? amount.toLocaleString() + '원' : '-'}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>결제수단</span>
            <span className={styles.value}>{method}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <Button className="w-44 h-11" onClick={() => navigate('/payment/wallet-point')}>
            다시 충전하기
          </Button>
          <Button className="w-44 h-11" onClick={() => navigate('/')}>
            메인으로
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChargeFailPage
