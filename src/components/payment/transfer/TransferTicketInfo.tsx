import styles from '@components/payment/transfer/TransferTicketInfo.module.css'

interface TransferTicketInfoProps {
  title: string
  date: string
  seat: string
  sender: string
  receiver: string
}

const TransferTicketInfo: React.FC<TransferTicketInfoProps> = ({
  title,
  date,
  seat,
  sender,
  receiver,
}) => {
  return (
    <div className={styles.ticketBox}>
      <div className={styles.thumbnail} />
      <div className={styles.ticketDetail}>
        <div className={styles.infoRow}>
          <span className={styles.label}>페스티벌 제목</span>
          <span className={styles.value}>{title}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>페스티벌 날짜</span>
          <span className={styles.value}>{date}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>좌석</span>
          <span className={styles.value}>{seat}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>양도자</span>
          <span className={styles.value}>{sender}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>양수자</span>
          <span className={styles.value}>{receiver}</span>
        </div>
      </div>
    </div>
  )
}

export default TransferTicketInfo
