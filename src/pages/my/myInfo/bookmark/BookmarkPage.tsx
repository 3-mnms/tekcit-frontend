import React from 'react';
import styles from './BookmarkPage.module.css';
import BookmarkCard from '@/components/my/myinfo/BookmarkCard';
import { useFavoriteToggle, useMyFavoritesInfinite } from '@/models/bookmark/useFavorite';

const PAGE_SIZE = 20;

const BookmarkPage: React.FC = () => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useMyFavoritesInfinite(PAGE_SIZE);

  const { remove } = useFavoriteToggle();

  const items = React.useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.items),
    [data]
  );

  const handleToggleBookmark = (fid: string) => {
    // 목록 페이지에서는 '해제' 동작
    remove.mutate(fid);
  };

  if (isLoading) {
    return <div className={styles.pageWrapper}><div className={styles.title}>북마크</div><div>불러오는 중…</div></div>;
  }
  if (isError) {
    return <div className={styles.pageWrapper}><div className={styles.title}>북마크</div><div>불러오기에 실패했어요.</div></div>;
  }

  return (
    <div className={styles.pageWrapper}>
      <h2 className={styles.title}>북마크</h2>

      <div className={styles.cardContainer}>
        <div className={styles.cardList}>
          {items.length === 0 ? (
            <div className={styles.empty}>저장한 북마크가 없어요.</div>
          ) : (
            items.map((it) => (
              <BookmarkCard
                key={it.fid}
                id={it.fid}
                name={it.name}
                thumbnailUrl={it.thumbnailUrl ?? undefined}
                isBookmarked={true}
                onToggleBookmark={handleToggleBookmark}
              />
            ))
          )}
        </div>

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
    </div>
  );
};

export default BookmarkPage;
