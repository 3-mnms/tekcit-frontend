import styles from './WalletHistory.module.css'

export type WalletHistoryViewItem = {
  id: string                              // 주석: 키용 식별자(paymentId 등) 멍
  createdAt: string                       // 주석: ISO 문자열 멍
  type: 'charge' | 'refund' | 'use'       // 주석: 충전/환불/사용 멍
  amount: number                          // 주석: 금액(원) 멍
}

export type WalletHistoryProps = {
  month?: string                          // 주석: 상단 타이틀에 표기할 월(예: '9월 거래 내역') 멍
  items: WalletHistoryViewItem[]          // 주석: 표시할 아이템 목록 멍
  loading?: boolean                       // 주석: 로딩 상태 멍
  error?: string | null                   // 주석: 에러 메시지 멍
}

const WalletHistory: React.FC<WalletHistoryProps> = ({ month, items, loading, error }) => {
  // 주석: 통화 포맷 멍
  const fmtCurrency = (n: number) => `${n.toLocaleString('ko-KR')}원`

  // 주석: 날짜/시간 분리 포맷 멍
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

  const hasAny = items.length > 0

  return (
    <div className={styles.wrap} aria-live="polite">
      {month && <div className={styles.sectionTitle}>테킷 페이 내역</div>}

      {/* 주석: 헤더 행(날짜/시간/내역/금액) 멍 */}
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
          {items.map((it, idx) => {
            // 주석: 타입별 표시 텍스트/부호/색상 결정 멍
            const sign = it.type === 'charge' || it.type === 'refund' ? '+' : '-'
            const title = it.type === 'charge' ? '충전' : it.type === 'refund' ? '환불' : '사용'

            return (
              <li key={it.id} className={`${styles.item} ${idx % 2 ? styles.alt : ''}`}>
                <span className={styles.colDate}>{fmtDate(it.createdAt)}</span>
                <span className={styles.colTime}>{fmtTime(it.createdAt)}</span>
                <span className={`${styles.colDesc} ${it.type === 'use' ? styles.useText : ''}`}>{title}</span>
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
