// 주석: WalletHistory — 데이터를 부모에서 받아 '표시만' 하는 컴포넌트

import styles from './WalletHistory.module.css'

export type WalletHistoryViewItem = {
  id: string                              // 주석: 키용 식별자(paymentId 등) 멍
  createdAt: string                       // 주석: ISO 문자열 멍
  type: 'charge' | 'refund' | 'use'       // 주석: 충전/환불/사용 멍
  amount: number                          // 주석: 금액(원) 멍
}

export type WalletHistoryProps = {
  month?: string
  items: WalletHistoryViewItem[]
  loading?: boolean
  error?: string | null
}

const WalletHistory: React.FC<WalletHistoryProps> = ({ month, items, loading, error }) => {
  // 주석: 포맷 유틸 멍
  const fmtCurrency = (n: number) => `${n.toLocaleString('ko-KR')}원`
  const fmtDateTime = (iso: string) =>
    new Date(iso).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

  const hasAny = items.length > 0

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

      {!loading && error && <div className={styles.emptyBox} role="alert">{error}</div>}

      {!loading && !error && hasAny && (
        <ul className={styles.list}>
          {items.map((it, idx) => {
            const badgeClass =
              it.type === 'charge'
                ? styles.badgeCharge
                : it.type === 'refund'
                ? styles.badgeRefund
                : styles.badgeUse
            const sign = it.type === 'charge' || it.type === 'refund' ? '+' : '-'
            const title = it.type === 'charge' ? '충전' : it.type === 'refund' ? '환불' : '사용'
            return (
              <li key={it.id} className={`${styles.item} ${idx % 2 ? styles.alt : ''}`}>
                <span className={styles.colDate}>{fmtDateTime(it.createdAt)}</span>
                <span className={styles.colDesc}>
                  <span className={`${styles.badge} ${badgeClass}`}>{title}</span>
                </span>
                <span className={`${styles.colAmount} ${sign === '+' ? styles.amtPlus : styles.amtMinus}`}>
                  {sign}{fmtCurrency(it.amount)}
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {!loading && !error && !hasAny && (
        <div className={styles.emptyBox}>{month ? '선택한 월의 내역이 없어요' : '포인트 내역이 없어요'}</div>
      )}
    </div>
  )
}

export default WalletHistory
