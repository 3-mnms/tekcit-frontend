import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '@/components/common/button/Button'
import WalletHistory from '@/components/payment/pay/WalletHistory'
import { getWalletBalance } from '@/shared/api/payment/wallet'

import styles from './WalletPointPage.module.css'

const WalletPointPage: React.FC = () => {
  const navigate = useNavigate()
  const [balance, setBalance] = useState<number | null>(null)
  const [month, setMonth] = useState<string>(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })

  useEffect(() => {
    const sync = async () => setBalance(await getWalletBalance())
    sync()
    window.addEventListener('focus', sync)
    document.addEventListener('visibilitychange', sync)
    return () => {
      window.removeEventListener('focus', sync)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])

  const handleChargeClick = () => navigate('/payment/wallet-point/money-charge')

  const fmt = (n: number) => n.toLocaleString('ko-KR')

  return (
    <div className={styles.container}>
      {/* 상단 타이틀 바 */}
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>킷페이 내역</h1>
      </div>

      {/* 요약 카드 */}
      <section className={styles.summaryCard}>
        <div className={styles.summaryLeft}>
          <div className={styles.summaryLabel}>현재 잔액</div>
          <div className={styles.summaryValue}>
            {balance === null ? <span className={styles.skeleton} /> : `${fmt(balance)}원`}
          </div>
        </div>

        <div className={styles.summaryRight}>
          <Button className={styles.chargeBtn} onClick={handleChargeClick}>충전</Button>
        </div>
      </section>

      {/* 월 선택 필터 */}
      <div className={styles.filterBar}>
        <select
          className={styles.monthSelect}
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          {/* 최근 6개월 정도 */}
          {Array.from({ length: 6 }).map((_, i) => {
            const d = new Date(); d.setMonth(d.getMonth() - i)
            const v = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            const label = `${d.getMonth() + 1}월`
            return <option key={v} value={v}>{label}</option>
          })}
        </select>
      </div>

      {/* 이용내역: 컴포넌트가 비어 있을 때의 빈 상태를 보완용으로 아래 블럭 노출 */}
      <section className={styles.historySection}>
        <WalletHistory month={month} />
        {/* 필요 시 WalletHistory가 비었을 때만 보여주도록 조건 처리 가능 */}
          <div className={styles.emptyAction}>
            <Button
              onClick={() => {
                const d = new Date(`${month}-01`)
                d.setMonth(d.getMonth() - 1)
                const v = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                setMonth(v)
              }}
            >
              지난달 내역 보기
            </Button>
          </div>
      </section>
    </div>
  )
}

export default WalletPointPage