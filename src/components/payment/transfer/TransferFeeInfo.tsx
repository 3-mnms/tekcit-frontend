import styles from '@components/payment/transfer/TransferFeeInfo.module.css'

interface TransferFeeInfoProps {
  perFee: number
  totalFee: number
}

const TransferFeeInfo: React.FC<TransferFeeInfoProps> = ({ perFee, totalFee }) => {
  return (
    <div className={styles.feeBox}>
      <div className={styles.feeRow}>
        <span className={styles.feeLabel}>수수료 금액</span>
        <span className={styles.feeValue}>{perFee.toLocaleString()}원</span>
      </div>
      <div className={styles.feeRow}>
        <span className={styles.feeLabel}>총 수수료 결제 금액</span>
        <span className={styles.feeValue}>{totalFee.toLocaleString()}원</span>
      </div>
    </div>
  )
}

export default TransferFeeInfo
