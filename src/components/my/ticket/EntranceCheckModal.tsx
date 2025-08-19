import React from 'react'
import styles from './EntranceCheckModal.module.css'

interface EntranceCheckModalProps {
  isOpen: boolean
  onClose: () => void
  count: number
  totalCount: number
  title: string
  date: string
  time: string
}

const EntranceCheckModal: React.FC<EntranceCheckModalProps> = ({
  isOpen,
  onClose,
  count,
  totalCount = 10,
  title,
  date,
  time,
}) => {
  if (!isOpen) return null

  const percentage = Math.floor((count / totalCount) * 100)

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          &times;
        </button>

        <div className={styles.block}>
          <div className={styles.highlightCard}>
            <p className={styles.cardLabel}>{title} 공연 입장 인원</p>
            <p className={styles.cardCount}>
              {count}명 / {totalCount}명
            </p>
            <div className={styles.progressBar}>
              <div
                className={styles.progress}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className={styles.percentLabel}>{percentage}%</p>
          </div>
        </div>

        
      </div>
    </div>
  )
}

export default EntranceCheckModal