import styles from './WalletHistory.module.css'
import { payHistory } from '@/models/payment/WalletHistory'

const PayHistoryTable: React.FC = () => {
  return (
    <div>
      <div className={styles.usageBox}>
        <div className={styles.historyHeader}>
          <span className={styles.historyDate}>날짜</span>
          <span className={styles.historyDesc}>내역</span>
          <span className={styles.historyAmount}>금액</span>
        </div>

        <ul className={styles.historyList}>
          {payHistory.map((item) => (
            <li key={item.id} className={styles.historyItem}>
              <span className={styles.historyDate}>{item.date}</span>
              <span className={styles.historyDesc}>{item.description}</span>
              <span className={styles.historyAmount}>{item.amount}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default PayHistoryTable
