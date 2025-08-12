import React from 'react';
import styles from './BookmarkCard.module.css';
import type { BookmarkCardProps } from '@/models/bookmark/BookmarkItem';

const BookmarkCard: React.FC<BookmarkCardProps> = ({
  id,
  name,
  isBookmarked,
  onToggleBookmark,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.thumbnail}>
        <span className={styles.imagePlaceholder}>🖼</span>
      </div>

      <button className={styles.heartIcon} onClick={() => onToggleBookmark(id)}>
        {isBookmarked ? '❤️' : '🤍'}
      </button>

      <p className={styles.performanceName}>{name}</p>
    </div>
  );
};

export default BookmarkCard;
