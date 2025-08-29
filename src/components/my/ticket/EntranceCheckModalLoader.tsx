// src/components/my/ticket/EntranceCheckModalLoader.tsx
import React from 'react'
import EntranceCheckModal from '@/components/my/ticket/EntranceCheckModal'
import { useEnterStatistics } from '@/models/my/ticket/tanstack-query/useEnterStatistics'
import styles from './EntranceCheckModal.module.css'

type Props = {
  isOpen: boolean
  onClose: () => void
  festivalId: string
  performanceDateISO: string
  title: string
}

const EntranceCheckModalLoader: React.FC<Props> = ({
  isOpen,
  onClose,
  festivalId,
  performanceDateISO,
  title,
}) => {
  const { data, isLoading, isError } = useEnterStatistics(
    festivalId,
    performanceDateISO,
    isOpen, // 모달 열렸을 때만 호출
  )

  if (!isOpen) return null

  if (isLoading) {
    return (
      <div className={styles.overlay}>
        <div className={styles.highlightCard}>
          <button className={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
          <p className={styles.cardLabel}>{title} 공연 입장 인원</p>
          <p className={styles.cardCount}>불러오는 중…</p>
          <div className={styles.progressBar}>
            <div className={styles.progress} style={{ width: `0%` }} />
          </div>
          <p className={styles.percentLabel}>0%</p>
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className={styles.overlay}>
        <div className={styles.highlightCard}>
          <button className={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
          <p className={styles.cardLabel}>{title} 공연 입장 인원</p>
          <p className={styles.cardCount}>통계를 불러오지 못했어요 😿</p>
        </div>
      </div>
    )
  }

  return (
    <EntranceCheckModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      count={data.checkedInCount}
      totalCount={data.availableNOP}
    />
  )
}

export default EntranceCheckModalLoader
