import React from 'react'
import styles from './TransferTicketPage.module.css'
import { useNavigate } from 'react-router-dom'

interface Ticket {
  id: number
  date: string
  number: string
  title: string
  time: string
  count: number
  status: '결제 완료' | '결제 대기' | '취소 완료'
  imageUrl: string
  isTransferred: boolean
}

const dummyTickets: Ticket[] = [
  {
    id: 1,
    date: '2025.07.01',
    number: 'A123456',
    title: 'GMF 2025',
    time: '2025.10.18 17:00',
    count: 2,
    status: '결제 완료',
    imageUrl: 'https://images.unsplash.com/photo-1497032205916-ac775f0649ae?w=200&h=280&fit=crop',
    isTransferred: false,
  },
  {
    id: 2,
    date: '2025.07.02',
    number: 'B987654',
    title: '뮤지컬 캣츠',
    time: '2025.11.10 19:30',
    count: 1,
    status: '결제 완료',
    imageUrl: 'https://images.unsplash.com/photo-1497032205916-ac775f0649ae?w=200&h=280&fit=crop',
    isTransferred: true,
  },
]

const TransferTicketPage: React.FC = () => {
  const navigate = useNavigate()

  // ✅ 양도하기 클릭 시 /mypage/ticket/transfer/test 로 이동 + state 전달
  const handleTransfer = (ticket: Ticket) => {
    navigate('/mypage/ticket/transfer/test', {
      state: {
        ticketId: ticket.id,
        ticket, // Transfer 대상 페이지에서 바로 사용 가능
      },
    })
  }

  const visibleTickets = dummyTickets.filter((t) => t.status === '결제 완료')

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>티켓 양도</h2>
      <div className={styles.list}>
        {visibleTickets.map((ticket) => (
          <div key={ticket.id} className={styles.card}>
            <img src={ticket.imageUrl} alt={`${ticket.title} 포스터`} className={styles.poster} />
            <div className={styles.details}>
              <div className={styles.info}>
                <p><strong>예매일</strong>: {ticket.date}</p>
                <p><strong>예매번호</strong>: {ticket.number}</p>
                <p><strong>공연명</strong>: {ticket.title}</p>
                <p><strong>일시</strong>: {ticket.time}</p>
                <p><strong>매수</strong>: {ticket.count}</p>
              </div>
              <div className={styles.buttonWrapper}>
                {ticket.isTransferred ? (
                  <span className={styles.transferredBadge}>양도 완료됨</span>
                ) : (
                  <button
                    className={styles.transferBtn}
                    onClick={() => handleTransfer(ticket)}
                  >
                    양도하기
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TransferTicketPage