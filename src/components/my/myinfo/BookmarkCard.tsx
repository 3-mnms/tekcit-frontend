import React from 'react';
import { Link } from 'react-router-dom';
import styles from './BookmarkCard.module.css';
import type { BookmarkCardProps } from '@/models/bookmark/BookmarkItem';

const BookmarkCard: React.FC<BookmarkCardProps> = ({
  id,                    // = fid
  name,
  isBookmarked,
  onToggleBookmark,
  thumbnailUrl,
}) => {
  const to = `/festival/${encodeURIComponent(id)}`;

  const onHeartClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();  
    e.stopPropagation();  
    onToggleBookmark(id);
  };

  return (
    <Link to={to} className={styles.card} title={name} aria-label={name}>
      <div className={styles.thumbnail}>
        {thumbnailUrl ? (
          <img className={styles.img} src={thumbnailUrl} alt={name} />
        ) : (
          <span className={styles.imagePlaceholder}>🖼</span>
        )}
      </div>

      <button className={styles.heartIcon} onClick={onHeartClick} aria-label="즐겨찾기 토글">
        {isBookmarked ? '❤️' : '🤍'}
      </button>

      <p className={styles.performanceName}>{name}</p>
    </Link>
  );
};

export default BookmarkCard;
