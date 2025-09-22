import React from 'react'
import { Link } from 'react-router-dom'
import styles from './BookmarkCard.module.css'
import type { BookmarkCardProps } from '@/models/bookmark/BookmarkItem'
import { Calendar, MapPin, Heart } from 'lucide-react'

const BookmarkCard: React.FC<BookmarkCardProps> = ({
  id,
  name,
  isBookmarked,
  onToggleBookmark,
  thumbnailUrl,
}) => {
  const to = `/festival/${encodeURIComponent(id)}`
  const onHeartClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleBookmark(id)
  }

  return (
    <Link to={to} className={styles.card}>
      <div className={styles.thumbWrap}>
        {thumbnailUrl ? (
          <img className={styles.img} src={thumbnailUrl} alt={name} />
        ) : (
          <div className={styles.placeholder}>🖼</div>
        )}
        <button
          className={styles.heartBtn}
          onClick={onHeartClick}
          aria-label="즐겨찾기 해제"
        >
          <Heart
            className={`${styles.heartIcon} ${isBookmarked ? styles.active : ''}`}
          />
        </button>
      </div>

      <div className={styles.info}>
        <p className={styles.name}>{name}</p>
        {/* <div className={styles.meta}>
          <Calendar className={styles.metaIcon} />
          <span>공연일 추후 공개</span>
        </div>
        <div className={styles.meta}>
          <MapPin className={styles.metaIcon} />
          <span>장소 미정</span>
        </div> */}
      </div>
    </Link>
  )
}

export default BookmarkCard
