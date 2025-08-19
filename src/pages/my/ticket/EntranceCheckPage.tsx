// pages/EntranceCheckPage.tsx
import React, { useState } from 'react'
import styles from './EntranceCheckPage.module.css'
import EntranceCheckModal from '@/components/my/ticket/EntranceCheckModal'

interface TicketInfo {
  id: number
  date: string
  number: string
  title: string
  time: string
  count: number
}

const dummyTickets: TicketInfo[] = [
  {
    id: 1,
    date: '2025.07.01',
    number: 'A123456',
    title: 'GMF 2025',
    time: '2025.10.18 17:00',
    count: 2,
  },
  {
    id: 2,
    date: '2025.07.02',
    number: 'B987654',
    title: '뮤지컬 캣츠',
    time: '2025.11.10 19:30',
    count: 1,
  },
]

const EntranceCheckPage: React.FC = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSelect = (id: number) => {
    setSelectedId(id)
  }

  const handleCheck = () => {
    setIsModalOpen(true)
  }

  const selectedTicket = dummyTickets.find((t) => t.id === selectedId)

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>입장 인원 수 조회</h2>
      <div className={styles.ticketList}>
        {dummyTickets.map((ticket) => (
          <div
            key={ticket.id}
            className={`${styles.ticketCard} ${selectedId === ticket.id ? styles.selected : ''}`}
            onClick={() => handleSelect(ticket.id)}
          >
            <div className={styles.cardContent}>
              <p>
                <strong>예매일:</strong> {ticket.date}
              </p>
              <p>
                <strong>예매번호:</strong> {ticket.number}
              </p>
              <p>
                <strong>공연명:</strong> {ticket.title}
              </p>
              <p>
                <strong>일시:</strong> {ticket.time}
              </p>
              <p>
                <strong>매수:</strong> {ticket.count}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button className={styles.checkBtn} disabled={selectedId === null} onClick={handleCheck}>
        입장 인원 수 조회하기
      </button>

      <EntranceCheckModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        count={selectedTicket?.count ?? 0} // 👈 count 값 전달
        totalCount={10} // 👈 예시로 10명으로 고정. 나중에 서버에서 받아오면 바꿔
        title={selectedTicket?.title ?? ''}
        date={selectedTicket?.date ?? ''}
        time={selectedTicket?.time ?? ''}
      />
    </div>
  )
}

export default EntranceCheckPage