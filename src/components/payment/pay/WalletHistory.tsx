import { useEffect, useMemo, useState } from 'react'
import styles from './WalletHistory.module.css'
import { getWalletHistory, type WalletHistoryItem } from '@/shared/api/payment/wallet'

export type WalletHistoryProps = {
  month?: string   // "YYYY-MM"
  limit?: number
}

const WalletHistory: React.FC<WalletHistoryProps> = ({ month, limit }) => {
  const [items, setItems] = useState<WalletHistoryItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
      ; (async () => {
        try {
          setLoading(true)
          setError(null)
          const data = await getWalletHistory()
          if (!alive) return
          setItems(Array.isArray(data) ? data : [])
        } catch {
          if (!alive) return
          setError('내역을 불러오지 못했어요')
          setItems([])
        } finally {
          if (alive) setLoading(false)
        }
      })()
    return () => { alive = false }
  }, [])

  const toMonthKey = (v: string | number | Date) => {
    const d = new Date(v)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }

  const sorted = useMemo(
    () => [...items].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [items]
  )

  const filtered = useMemo(
    () => (month ? sorted.filter(i => toMonthKey(i.createdAt) === month) : sorted),
    [sorted, month]
  )
  
  const visible = useMemo(
    () => (limit ? filtered.slice(0, limit) : filtered),
    [filtered, limit],
  )

  const hasAny = items.length > 0          // 전체 데이터 존재 여부 멍
  const hasVisible = visible.length > 0    // 필터/limit 적용 후 존재 여부 멍

  const fmtCurrency = (n: number) => `${n.toLocaleString('ko-KR')}원`
  const fmtDateTime = (iso: string) =>
    new Date(iso).toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    })

  return (
    <div className={styles.wrap} aria-live="polite">
      <div className={styles.headerRow}>
        <span className={styles.colDate}>날짜</span>
        <span className={styles.colDesc}>내역</span>
        <span className={styles.colAmount}>금액</span>
      </div>

      {loading && (
        <ul className={styles.list} aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={`sk-${i}`} className={`${styles.item} ${styles.skeleton}`}>
              <span className={styles.colDate} />
              <span className={styles.colDesc} />
              <span className={styles.colAmount} />
            </li>
          ))}
        </ul>
      )}

      {!loading && error && (
        <div className={styles.emptyBox} role="alert">{error}</div>
      )}

      {!loading && !error && hasVisible && (
        <ul className={styles.list}>
          {visible.map((it, idx) => (
            <li key={it.id} className={`${styles.item} ${idx % 2 ? styles.alt : ''}`}>
              <span className={styles.colDate}>{fmtDateTime(it.createdAt)}</span>
              <span className={styles.colDesc}>
                <span
                  className={`${styles.badge} ${it.type === 'charge'
                      ? styles.badgeCharge
                      : it.type === 'refund'
                        ? styles.badgeRefund
                        : styles.badgeUse
                    }`}
                >
                  {it.type === 'charge' ? '충전' : it.type === 'refund' ? '환불' : '사용'}
                </span>
              </span>
              <span
                className={`${styles.colAmount} ${it.type === 'charge' || it.type === 'refund' ? styles.amtPlus : styles.amtMinus
                  }`}
              >
                {it.type === 'charge' || it.type === 'refund' ? '+' : '-'}{fmtCurrency(it.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* ✅ 빈 상태: 전체가 비었을 때만 기본 문구, 월 필터로만 비었을 땐 다른 문구 멍 */}
      {!loading && !error && !hasVisible && (
        <div className={styles.emptyBox}>
          {hasAny ? '선택한 월의 내역이 없어요' : '포인트 내역이 없어요'}
        </div>
      )}
    </div>
  )
}

export default WalletHistory
