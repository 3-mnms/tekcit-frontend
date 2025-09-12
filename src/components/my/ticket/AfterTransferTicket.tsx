import React from 'react'
import styles from './AfterTransferTicket.module.css'
import Button from '@/components/common/button/Button'

const priceFormatter = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  maximumFractionDigits: 0,
})

type Relation = '가족' | '지인'
type RawStatus = string | number
type NormalizedStatus = 'REQUEST' | 'APPROVED' | 'REJECTED'

function normalizeStatus(s?: RawStatus): NormalizedStatus {
  if (typeof s === 'number') {
    if (s === 0 || s === 1) return 'REQUEST'
    if (s === 2) return 'APPROVED'
    if (s === 3) return 'REJECTED'
    return 'REQUEST'
  }
  const v = (s ?? '').toString().trim().toUpperCase()
  if (['0', '1', 'REQUESTED', 'APPROVED', 'WAITING', 'PENDING'].includes(v)) return 'REQUEST'
  if (['2', 'COMPLETED', 'SUCCESS', 'OK'].includes(v)) return 'APPROVED'
  if (['3', 'REJECTED', 'DENIED', 'DECLINED', 'CANCELED', 'CANCELLED'].includes(v)) return 'REJECTED'
  return 'REQUEST'
}

type Props = {
  title: string
  date: string
  time: string
  relation: Relation
  status: RawStatus
  posterUrl?: string
  price?: number
  count: number
  onAccept?: () => void
  onReject?: () => void
  className?: string
}

const AfterTransferTicket: React.FC<Props> = ({
  title,
  date,
  time,
  relation,
  status,
  posterUrl,
  price,
  count,
  onAccept,
  onReject,
  className = '',
}) => {
  const fallbackPoster = '/dummy-poster.jpg'
  const showPrice = relation === '지인' && Number.isFinite(price)
  const s = normalizeStatus(status)

  const totalPrice = showPrice ? (price as number) * count : null

  return (
    <div className={`${styles.card} ${className}`}>
      {/* 포스터 */}
      <div className={styles.thumbWrap}>
        <img
          src={posterUrl || fallbackPoster}
          alt={`${title} 포스터`}
          className={styles.img}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement
            img.src = fallbackPoster
          }}
        />
      </div>

      {/* 내용 */}
      <div className={styles.body}>
        <div className={styles.headRow}>
          <div className={styles.bookInfo}>
            <span className={styles.smallMeta}>공연명</span>
            <h3 className={styles.title} title={title}>{title}</h3>
          </div>
          <span
            className={`${styles.badge} ${
              s === 'REQUEST' ? styles.badgeRequest : s === 'APPROVED' ? styles.badgeApproved : styles.badgeRejected
            }`}
          >
            {s === 'REQUEST' ? '양도 요청' : s === 'APPROVED' ? '양도 승인' : '양도 거부'}
          </span>
        </div>

        <div className={styles.grid3}>
          <div className={styles.metaItem}><span className={styles.metaKey}>일시 |</span><span className={styles.metaVal}>{date} {time}</span></div>
          <div className={styles.metaItem}><span className={styles.metaKey2}>관계 |</span><span className={styles.metaVal}>{relation}</span></div>
          <div className={styles.metaItem}><span className={styles.metaKey3}>매수 |</span><span className={styles.metaVal}>{count}매</span></div>
        </div>

        {showPrice ? (
          <div className={styles.priceRow}>
            <span className={styles.metaKey}>가격</span>
            <span className={styles.priceVal}>
              {priceFormatter.format(totalPrice!)} <em className={styles.unit}>{priceFormatter.format(price!)} × {count}</em>
            </span>
          </div>
        ) : (
          <div className={styles.priceRowHidden} aria-hidden="true" />
        )}

        {s === 'REQUEST' && (
          <div className={styles.actions}>
            <Button type="button" className={`${styles.btn} ${styles.primary}`} onClick={onAccept} aria-label="양도 수락">
              수락
            </Button>
            <Button type="button" className={`${styles.btn} ${styles.ghost}`} onClick={onReject} aria-label="양도 거절">
              거절
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AfterTransferTicket
