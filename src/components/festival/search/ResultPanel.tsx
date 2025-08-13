import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchFestivals } from '@shared/api/festival/SearchApi';
import type { FestivalItem } from '@/models/festival/FestivalSearchTypes';
import styles from './ResultPanel.module.css';

const CHUNK = 6;

const UI_TO_GENRE: Record<string, string> = {
  pop: '대중음악',
  theater: '뮤지컬/연극',
  dance: '무용',
  classic: '클래식/국악',
  magic: '서커스/마술',
  mix: '복합',
};

const normalize = (raw: any, idx: number): FestivalItem => {
  const id = raw?.id ?? raw?.festivalId ?? raw?.uuid ?? `${raw?.code ?? 'no-id'}-${idx}`;
  const title =
    raw?.title ??
    raw?.name ??
    raw?.festivalName ??
    raw?.fname ??
    raw?.festivalDetail?.fname ??
    '(제목 없음)';
  const poster =
    raw?.poster ?? raw?.posterUrl ?? raw?.imageUrl ?? raw?.thumbnailUrl ?? raw?.posterFile;
  const venue =
    raw?.venue ??
    raw?.place ??
    raw?.location?.name ??
    raw?.hallName ??
    raw?.fcltynm ??
    raw?.festivalDetail?.fcltynm;
  const start =
    raw?.startDate ??
    raw?.start_time ??
    raw?.start ??
    raw?.beginDate ??
    raw?.fdfrom ??
    raw?.festivalDetail?.fdfrom;
  const end =
    raw?.endDate ??
    raw?.end_time ??
    raw?.end ??
    raw?.finishDate ??
    raw?.fdto ??
    raw?.festivalDetail?.fdto;

  const dateRange =
    raw?.dateRange ??
    (start ? (end && start !== end ? `${start} ~ ${end}` : start) : undefined);

  return { id, title, poster, venue, dateRange };
};

const ResultPanel: React.FC = () => {
  const [params] = useSearchParams();

  const keyword = (params.get('keyword') || '').trim();
  const categorySlug = params.get('category') || undefined;
  const genre = categorySlug ? UI_TO_GENRE[categorySlug] : undefined;

  const { data, isLoading, isError } = useQuery<any[]>({
    queryKey: ['searchResults', { keyword, genre }],
    queryFn: () => searchFestivals({ keyword: keyword || undefined, genre }),
    enabled: !!keyword || !!genre,
    staleTime: 60_000,
    keepPreviousData: true,
  });

  const normalized: FestivalItem[] = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    return list.map((r, i) => normalize(r, i));
  }, [data]);

  const [visibleCount, setVisibleCount] = useState(CHUNK);
  useEffect(() => {
    setVisibleCount(CHUNK);
  }, [keyword, genre]);

  const total = normalized.length;
  const itemsToShow = normalized.slice(0, visibleCount);
  const canLoadMore = visibleCount < total;

  if (!keyword && !genre) return <div className={styles.message}>검색어 또는 장르를 선택해 주세요.</div>;
  if (isLoading) return <div className={styles.message}>로딩 중…</div>;
  if (isError) return <div className={styles.message}>검색 중 오류가 발생했어요.</div>;

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        {genre ? `[${genre}] ` : ''}
        {keyword ? `“${keyword}” ` : ''}검색 결과 {total}건
      </div>

      {itemsToShow.length ? (
        <>
          <div className={styles.grid}>
            {itemsToShow.map((f, i) => (
              <article key={String(f.id ?? i)} className={styles.card}>
                {f.poster && (
                  <img src={f.poster} alt={f.title} className={styles.poster} />
                )}
                <h3 className={styles.cardTitle} title={f.title}>
                  {f.title}
                </h3>
                {f.venue && <p className={styles.venue}>{f.venue}</p>}
                {f.dateRange && <p className={styles.date}>{f.dateRange}</p>}
              </article>
            ))}
          </div>

          {canLoadMore && (
            <div className={styles.loadMoreWrap}>
              <button
                type="button"
                onClick={() => setVisibleCount((c) => Math.min(c + CHUNK, total))}
                className={styles.loadMoreBtn}
              >
                더보기
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={styles.message}>표시할 결과가 없어요.</div>
      )}
    </section>
  );
};

export default ResultPanel;
