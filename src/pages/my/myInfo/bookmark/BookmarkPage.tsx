import React from 'react'
import styles from './BookmarkPage.module.css'
import BookmarkCard from '@/components/my/myinfo/BookmarkCard'
import { useFavoriteToggle, useMyFavoritesInfinite } from '@/models/bookmark/useFavorite'
import Spinner from '@/components/common/spinner/Spinner'

const PAGE_SIZE = 20

const BookmarkPage: React.FC = () => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useMyFavoritesInfinite(PAGE_SIZE)

  const { remove } = useFavoriteToggle()

  const items = React.useMemo(() => (data?.pages ?? []).flatMap((p) => p.items), [data])

  const handleToggleBookmark = (fid: string) => {
    remove.mutate(fid)
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>북마크</h2>
      </div>

      {isLoading && <Spinner/>}
      {isError && <div className={styles.stateBox}>불러오기에 실패했어요.</div>}

      {!isLoading && !isError && (
        <div className={styles.cardContainer}>
          {items.length === 0 ? (
            <div className={styles.emptyBox}>
              <span className={styles.emptyIcon}>💙</span>
              <h3 className={styles.emptyTitle}>저장된 북마크가 없습니다</h3>
              <p className={styles.emptyDesc}>관심있는 공연을 북마크에 추가해보세요.</p>
            </div>
          ) : (
            <div className={styles.cardGrid}>
              {items.map((it) => (
                <BookmarkCard
                  key={it.fid}
                  id={it.fid}
                  name={it.name}
                  thumbnailUrl={it.thumbnailUrl ?? undefined}
                  isBookmarked={true}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))}
            </div>
          )}

          {hasNextPage && (
            <button
              className={styles.loadMore}
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? '불러오는 중…' : '더 보기'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default BookmarkPage
