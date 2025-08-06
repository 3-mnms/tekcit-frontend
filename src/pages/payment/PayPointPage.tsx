import Button from '@/components/common/button/Button'
import styles from './PayPointPage.module.css'
import PayHistoryTable from '@/components/payment/PayHistoryTable'

const PayPointPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>페이 포인트 충전</h1>

        {/* ✅ 네모 박스 추가 */}
        <div className={styles.moneySection}>
          <div className={styles.moneyGroup}>
            <div className={styles.moneyBlock}>
              <span className={styles.label}>페이 머니</span>
              <Button className="w-[190px] h-10">충전</Button>
            </div>

            <div className={styles.moneyBlock}>
              <span className={styles.amount}>5,000원</span>
              <Button className="w-[190px] h-10">환불</Button>
            </div>
          </div>
        </div>
      </div>
      <h2 className={styles.subtitle}>이용내역</h2>
      <PayHistoryTable />
    </div>
  )
}

export default PayPointPage
