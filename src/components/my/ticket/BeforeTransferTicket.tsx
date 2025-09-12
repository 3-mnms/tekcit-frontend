import React from 'react'
import styles from './BeforeTransferTicket.module.css'
import type { TransferListItem } from '@/models/my/ticket/ticketTypes'
import Button from '@/components/common/button/Button'

type Props = {
  item: TransferListItem
  onTransfer: (reservationNumber: string) => void
}

const BeforeTransferTicket: React.FC<Props> = ({ item, onTransfer }) => {
  const fallbackPoster = '/dummy-poster.jpg'
  const posterSrc = item.posterFile ? encodeURI(item.posterFile) : fallbackPoster

  return (
    <div className={styles.card}>
      <div className={styles.thumbWrap}>
        <img
          src={posterSrc}
          alt={item.title}
          className={styles.img}
          onError={(e) => ((e.currentTarget as HTMLImageElement).src = fallbackPoster)}
        />
      </div>

      <div className={styles.body}>
        <div className={styles.headRow}>
          <div className={styles.smallRow}>
            <span className={styles.smallMeta}>예매일 {item.date}</span>
            <span className={styles.divider}>|</span>
            <span className={styles.smallMeta}>예매번호 {item.number}</span>
          </div>
          {/* 필요시 상태 배지 넣을 자리 */}
        </div>

        <h3 className={styles.title} title={item.title}>{item.title}</h3>

        <div className={styles.grid3}>
          <div className={styles.metaItem}><span className={styles.metaKey}>일시 |</span><span className={styles.metaVal}>{item.dateTime}</span></div>
          <div className={styles.metaItem}><span className={styles.metaKey}>매수 |</span><span className={styles.metaVal}>{item.count}</span></div>
        </div>

        <div className={styles.actions}>
          <Button
            onClick={() => onTransfer(item.reservationNumber)}
            aria-label="티켓 양도하기"
          >
            양도하기
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BeforeTransferTicket
