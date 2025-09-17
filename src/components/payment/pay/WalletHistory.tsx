// src/components/payment/pay/WalletHistory.tsx - 환불 지원 추가
import styles from './WalletHistory.module.css'

export type WalletHistoryViewItem = {
  id: string
  createdAt: string
  type: 'charge' | 'use' | 'refund' | 'transfer_in' | 'transfer_out' | 'unknown' // refund 추가
  amount: number
  method?: string
  transactionType: 'CREDIT' | 'DEBIT' | 'UNKNOWN'
  paymentStatus: string
}

export type WalletHistoryProps = {
  month?: string
  items: WalletHistoryViewItem[]
  loading?: boolean
  error?: string | null
}

const WalletHistory: React.FC<WalletHistoryProps> = ({ month, items, loading, error }) => {
  const fmtCurrency = (n: number) => `${n.toLocaleString('ko-KR')}원`
  
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\s/g, '')

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

  const getDisplayInfo = (item: WalletHistoryViewItem) => {
    const { type } = item
    
    switch (type) {
      case 'charge':
        return { title: '충전', sign: '+', className: styles.chargeText || '' }
      case 'use':
        return { title: '사용', sign: '-', className: styles.useText || '' }
      case 'refund':
        return { title: '환불', sign: '+', className: styles.refundText || '' } // 환불 케이스 추가
      case 'transfer_in':
        return { title: '양도함', sign: '+', className: styles.transferInText || '' }
      default:
        return { title: '기타', sign: '-', className: styles.unknownText || '' }
    }
  }

  const hasAny = items.length > 0

  return (
    <div className={styles.wrap} aria-live="polite">
      {month && <div className={styles.sectionTitle}>테킷 페이 내역</div>}

      <div className={styles.headerRow}>
        <span className={styles.colDate}>날짜</span>
        <span className={styles.colTime}>시간</span>
        <span className={styles.colDesc}>내역</span>
        <span className={styles.colAmount}>금액</span>
      </div>

      {loading && (
        <ul className={styles.list} aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={`sk-${i}`} className={`${styles.item} ${styles.skeleton}`}>
              <span className={styles.colDate} />
              <span className={styles.colTime} />
              <span className={styles.colDesc} />
              <span className={styles.colAmount} />
            </li>
          ))}
        </ul>
      )}

      {!loading && error && <div className={styles.emptyBox} role="alert">{error}</div>}

      {!loading && !error && hasAny && (
        <ul className={styles.list}>
          {items.map((item, idx) => {
            const { title, sign, className } = getDisplayInfo(item)
            
            return (
              <li key={item.id} className={`${styles.item} ${idx % 2 ? styles.alt : ''}`}>
                <span className={styles.colDate}>{fmtDate(item.createdAt)}</span>
                <span className={styles.colTime}>{fmtTime(item.createdAt)}</span>
                <span className={`${styles.colDesc} ${className}`}>{title}</span>
                <span className={`${styles.colAmount} ${sign === '+' ? styles.amtPlus : styles.amtMinus}`}>
                  {sign}{fmtCurrency(item.amount)}
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {!loading && !error && !hasAny && (
        <div className={styles.emptyBox}>
          {month ? '선택한 월의 내역이 없어요' : '포인트 내역이 없어요'}
        </div>
      )}
    </div>
  )
}

export default WalletHistory