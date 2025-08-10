// 전자지갑 포인트 충전 완료 페이지
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import styles from './ChargeSuccessPage.module.css'

import Button from '@/components/common/button/Button'
import { chargeWallet } from '@/shared/api/payment/wallet'

const ChargeCompletePage: React.FC = () => {
  const { state } = useLocation() as {
    state?: { amount?: string; method?: '네이버페이' | '카카오페이'; txId?: string }
  }
  const navigate = useNavigate()
  const amount = Number(state?.amount ?? 0)
  const method = state?.method
  const txId = state?.txId

  useEffect(() => {
    if (!amount || !method) return
    const seenKey = `wallet.tx.seen:${txId ?? 'noid'}`
    if (sessionStorage.getItem(seenKey)) return
    chargeWallet(amount, method, txId)
    sessionStorage.setItem(seenKey, '1')
  }, [amount, method, txId])

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>충전이 완료되었습니다!</h2>
        <div className={styles.info}>
          <div>
            <span className={styles.label}>충전 금액</span>
            <span className={styles.value}>{amount.toLocaleString()}원</span>
          </div>
          <div>
            <span className={styles.label}>결제수단</span>
            <span className={styles.value}>{method ?? '-'}</span>
          </div>
        </div>
        <Button className={styles.btn} onClick={() => navigate('/payment/wallet-point')}>
          내역 보기
        </Button>
      </div>
    </div>
  )
}

export default ChargeCompletePage
