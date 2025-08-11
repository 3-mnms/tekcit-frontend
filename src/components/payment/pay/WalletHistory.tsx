import { useEffect, useState } from 'react'

import styles from './WalletHistory.module.css'

import { getWalletHistory, type WalletHistoryItem } from '@/shared/api/payment/wallet'

const PayHistoryTable: React.FC = () => {
  const [items, setItems] = useState<WalletHistoryItem[]>([])
  useEffect(() => {
    getWalletHistory().then(setItems)
  }, [])

  return (
    <div>
      <div className={styles.usageBox}>
        <div className={styles.historyHeader}>
          <span className={styles.historyDate}>날짜</span>
          <span className={styles.historyDesc}>내역</span>
          <span className={styles.historyAmount}>금액</span>
        </div>

        <ul className={styles.historyList}>
          {items.map((item) => (
            <li key={item.id} className={styles.historyItem}>
              <span className={styles.historyDate}>
                {new Date(item.createdAt).toLocaleString()}
              </span>
              <span className={styles.historyDesc}>{item.type === 'charge' ? '충전' : '환불'}</span>
              <span className={styles.historyAmount}>{item.amount.toLocaleString()}원</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default PayHistoryTable
