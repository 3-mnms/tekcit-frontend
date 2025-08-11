import styles from './RefundTicketInfo.module.css'

interface TransferTicketInfoProps {
  title: string
  date: string
  ticket: number
  sender: string
  receiver: string
  posterUrl?: string
}

const TransferTicketInfo: React.FC<TransferTicketInfoProps> = ({
  title,
  date,
  ticket,
  sender,
  receiver,
  posterUrl,
}) => {
  return (
    <div className={styles.ticketBox}>
      <div className={styles.thumbnail}>
        <img
          src={posterUrl || '/assets/no-poster.png'}
          alt="포스터"
          className={styles.posterImg}
        />
      </div>

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
          <span className={styles.label}>티켓 매수</span>
          <span className={styles.value}>{ticket}</span>
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
