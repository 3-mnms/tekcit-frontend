// 주석: 내역은 서버에서 page/size만 받아오고, 월 필터는 프론트에서 처리 멍
import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/common/button/Button'
import WalletHistory, { type WalletHistoryViewItem } from '@/components/payment/pay/WalletHistory'
import { useWalletBalance, useWalletHistory } from '@/shared/api/payment/tekcitHistory'
import styles from './WalletPointPage.module.css'

const PAGE_SIZE = 10

export default function WalletPointPage() {
  const navigate = useNavigate()
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [page, setPage] = useState(0)

  const { data: balanceData, isLoading: isBalanceLoading, refetch: refetchBalance } = useWalletBalance()
  const { data: historyPage, isLoading: isHistoryLoading, error: historyError, refetch: refetchHistory } =
    useWalletHistory({ page, size: PAGE_SIZE })

  useEffect(() => {
    const sync = () => { refetchBalance(); refetchHistory() }
    window.addEventListener('focus', sync)
    document.addEventListener('visibilitychange', sync)
    return () => { window.removeEventListener('focus', sync); document.removeEventListener('visibilitychange', sync) }
  }, [refetchBalance, refetchHistory])

  // 주석: 월 필터(YYYY-MM) — 서버에서 받은 content를 프론트에서 필터링 멍
  const filteredItems = useMemo(() => {
    const toYM = (iso: string) => {
      const d = new Date(iso)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    }
    const list = historyPage?.content ?? []
    return list.filter((it) => toYM(it.time) === month)
  }, [historyPage, month])

  // 주석: 뷰모델 변환 멍
  const viewItems: WalletHistoryViewItem[] = useMemo(() => {
    return filteredItems.map((row, idx) => {
      const method = (row.method ?? '').toUpperCase()
      const type: 'charge' | 'refund' | 'use' =
        method === 'REFUND' ? 'refund' : method === 'CHARGE' ? 'charge' : 'use'
      return {
        id: String(row.paymentId ?? `tx-${page}-${idx}`),
        createdAt: row.time,
        type,
        amount: Math.abs(row.amount),
      }
    })
  }, [filteredItems, page])

  const fmt = (n: number) => n.toLocaleString('ko-KR')
  const handleChargeClick = () => navigate('/payment/wallet-point/money-charge')

  return (
    <div className={styles.container}>
      {/* 상단 타이틀 바 */}
      <div className={styles.topbar}><h1 className={styles.pageTitle}>킷페이 내역</h1></div>

      {/* 잔액 카드 */}
      <section className={styles.summaryCard}>
        <div className={styles.summaryLeft}>
          <div className={styles.summaryLabel}>현재 잔액</div>
          <div className={styles.summaryValue}>
            {isBalanceLoading ? <span className={styles.skeleton} /> : `${fmt(balanceData?.availableBalance ?? 0)}원`}
          </div>
        </div>
        <div className={styles.summaryRight}>
          <Button className={styles.chargeBtn} onClick={handleChargeClick}>충전</Button>
        </div>
      </section>

      {/* 월 선택 + 페이지 이동 */}
      <div className={styles.filterBar}>
        <select
          className={styles.monthSelect}
          value={month}
          onChange={(e) => { setMonth(e.target.value); /* 주석: 서버 페이지는 그대로 유지해도 OK 멍 */ }}
        >
          {Array.from({ length: 6 }).map((_, i) => {
            const d = new Date(); d.setMonth(d.getMonth() - i)
            const v = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            return <option key={v} value={v}>{d.getMonth() + 1}월</option>
          })}
        </select>

        <div className={styles.pager}>
          <button className={styles.pagerBtn} disabled={!historyPage || historyPage.first} onClick={() => setPage(p => Math.max(0, p - 1))}>이전</button>
          <span className={styles.pageInfo}>{(historyPage?.number ?? 0) + 1} / {Math.max(1, historyPage?.totalPages ?? 1)}</span>
          <button className={styles.pagerBtn} disabled={!historyPage || historyPage.last} onClick={() => setPage(p => p + 1)}>다음</button>
        </div>
      </div>

      {/* 내역 표시 */}
      <section className={styles.historySection}>
        <WalletHistory month={month} items={viewItems} loading={isHistoryLoading} error={historyError ? '내역을 불러오지 못했어요 (서버 오류)' : null} />
        <div className={styles.emptyAction}>
          <Button onClick={() => {
            const d = new Date(`${month}-01`); d.setMonth(d.getMonth() - 1)
            setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
          }}>지난달 내역 보기</Button>
        </div>
      </section>
    </div>
  )
}
