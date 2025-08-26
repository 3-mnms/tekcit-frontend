import React, { useState } from 'react'
import styles from './BookmarkPage.module.css'
import BookmarkCard from '@/components/my/myinfo/BookmarkCard'
import type { BookmarkItem } from '@/models/bookmark/BookmarkItem'

const BookmarkPage: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([
    { id: 1, name: '공연 이름 1' },
    { id: 2, name: '공연 이름 2' },
    { id: 3, name: '공연 이름 3' },
  ])

  const [unbookmarkedIds, setUnbookmarkedIds] = useState<number[]>([])

  const handleToggleBookmark = (id: number) => {
    setUnbookmarkedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <div className={styles.pageWrapper}>
      <h2 className={styles.title}>북마크</h2>
      <div className={styles.cardContainer}>
        <div className={styles.cardList}>
          {bookmarks.map((item) => (
            <BookmarkCard
              key={item.id}
              id={item.id}
              name={item.name}
              isBookmarked={!unbookmarkedIds.includes(item.id)} 
              onToggleBookmark={handleToggleBookmark}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default BookmarkPage
