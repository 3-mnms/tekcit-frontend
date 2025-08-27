import styles from './TicketInfoSection.module.css'

export interface TransferTicketInfoProps {
  title: string    // 공연/티켓 제목 멍
  date: string     // 공연 일시 멍
  ticket: number   // 티켓 수량 멍
}

const TransferTicketInfo: React.FC<TransferTicketInfoProps> = ({
  title,
  date,
  ticket,
}) => {
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.row}><span>공연일시</span><span>{date}</span></div>
      <div className={styles.row}><span>수량</span><span>{ticket}매</span></div>
    </section>
  )
}

export default TransferTicketInfo
