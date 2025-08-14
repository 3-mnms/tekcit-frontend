import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchFestivals } from '@shared/api/festival/SearchApi';
import type { FestivalItem } from '@/models/festival/FestivalSearchTypes';
import styles from './ResultPanel.module.css';

const CHUNK = 6;
type Sale = '공연중' | '공연예정' | '공연종료' | undefined;
const DEFAULT_STATUSES: Sale[] = ['공연중', '공연예정'];

const parseDate = (s?: string) => {
  if (!s) return undefined;
  const d = new Date(s.slice(0, 10));
  return isNaN(d.getTime()) ? undefined : d;
};

const computeSale = (start?: string, end?: string, now = new Date()): Sale => {
  const s = parseDate(start);
  const e = parseDate(end) ?? s;
  if (!s) return undefined;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (today < s) return '공연예정';
  if (e && today > e) return '공연종료';
  return '공연중';
};

type Normalized = FestivalItem & {
  startRaw?: string;
  endRaw?: string;
  genreName?: string;
  sale?: Sale;
};

const normalize = (raw: any, idx: number): Normalized => {
  const id = raw?.fid ?? raw?.id ?? raw?.festivalId ?? raw?.uuid ?? `${raw?.code ?? 'no-id'}-${idx}`;
  const title =
    raw?.prfnm ??
    raw?.title ??
    raw?.name ??
    raw?.festivalName ??
    raw?.fname ??
    raw?.festivalDetail?.fname ??
    '(제목 없음)';

  const poster =
    raw?.poster ?? raw?.posterUrl ?? raw?.imageUrl ?? raw?.thumbnailUrl ?? raw?.posterFile;

  const venue =
    raw?.fcltynm ??
    raw?.venue ??
    raw?.place ??
    raw?.location?.name ??
    raw?.hallName ??
    raw?.fcltynm ??
    raw?.festivalDetail?.fcltynm;

  const start =
    raw?.prfpdfrom ??
    raw?.startDate ??
    raw?.start_time ??
    raw?.start ??
    raw?.beginDate ??
    raw?.fdfrom ??
    raw?.festivalDetail?.fdfrom;

  const end =
    raw?.prfpdto ??
    raw?.endDate ??
    raw?.end_time ??
    raw?.end ??
    raw?.finishDate ??
    raw?.fdto ??
    raw?.festivalDetail?.fdto;

  const sameDay = (a?: string, b?: string) => !!a && !!b && a.slice(0, 10) === b.slice(0, 10);
  const dateRange =
    raw?.dateRange ?? (start ? (end && !sameDay(start, end) ? `${start} ~ ${end}` : start) : undefined);

  const genreName = raw?.genrenm ?? raw?.genre ?? raw?.category ?? raw?.festivalDetail?.genreName;
  const sale = ((): Sale => {
    const s = parseDate(start);
    const e = parseDate(end) ?? s;
    if (!s) return undefined;
    const today = new Date();
    const today0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (today0 < s) return '공연예정';
    if (e && today0 > e) return '공연종료';
    return '공연중';
  })();

  return { id, title, poster, venue, dateRange, startRaw: start, endRaw: end, genreName, sale };
};

const ResultPanel: React.FC = () => {
  const [params] = useSearchParams();

  const keyword = (params.get('keyword') || '').trim();

  // ✅ status가 없으면 기본값 자동 적용 (가드 없이 첫 렌더부터 필터링)
  const selectedGenres = (params.get('genres') || '')
    .split(',').map((s) => s.trim()).filter(Boolean);

  const selectedStatus = (
    params.get('status') || DEFAULT_STATUSES.join(',')
  ).split(',').map((s) => s.trim()).filter(Boolean) as Sale[];

  const fromParam = params.get('from') || undefined;
  const toParam = params.get('to') || undefined;

  const genreForBackend = selectedGenres.length === 1 ? selectedGenres[0] : undefined;

  const { data, isLoading, isError } = useQuery<any[]>({
    queryKey: ['searchResults', { keyword, genreForBackend }],
    queryFn: () => searchFestivals({ keyword: keyword || undefined, genre: genreForBackend }),
    enabled: !!keyword || !!selectedGenres.length,
    staleTime: 60_000,
    keepPreviousData: true,
  });

  const normalized: Normalized[] = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    return list.map((r, i) => normalize(r, i));
  }, [data]);

  const filtered: Normalized[] = useMemo(() => {
    const fromD = parseDate(fromParam);
    const toD = parseDate(toParam) ?? fromD;

    return normalized.filter((item) => {
      if (selectedGenres.length) {
        if (!item.genreName || !selectedGenres.includes(item.genreName)) return false;
      }
      if (selectedStatus.length) {
        if (!item.sale || !selectedStatus.includes(item.sale)) return false;
      }
      if (fromD) {
        const s = parseDate(item.startRaw);
        const e = parseDate(item.endRaw) ?? s;
        if (!s) return false;
        const rangeTo = toD ?? fromD;
        const overlap = (e ?? s) >= fromD && s <= (rangeTo ?? fromD);
        if (!overlap) return false;
      }
      return true;
    });
  }, [normalized, selectedGenres, selectedStatus, fromParam, toParam]);

  const [visibleCount, setVisibleCount] = useState(CHUNK);
  useEffect(() => {
    setVisibleCount(CHUNK);
  }, [keyword, selectedGenres.join(','), selectedStatus.join(','), fromParam, toParam]);

  const total = filtered.length;
  const itemsToShow = filtered.slice(0, visibleCount);
  const canLoadMore = visibleCount < total;

  if (!keyword && !selectedGenres.length) return <div className={styles.message}>검색어 또는 장르를 선택해 주세요.</div>;
  if (isLoading) return <div className={styles.message}>로딩 중…</div>;
  if (isError) return <div className={styles.message}>검색 중 오류가 발생했어요.</div>;

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        {keyword ? `“${keyword}” ` : ''}
        {selectedGenres.length ? `[${selectedGenres.join(', ')}] ` : ''}
        검색 결과 {total}건
      </div>

      {itemsToShow.length ? (
        <>
          <div className={styles.grid}>
            {itemsToShow.map((f, i) => (
              <article key={String(f.id ?? i)} className={styles.card}>
                {f.poster && <img src={f.poster} alt={f.title} className={styles.poster} />}
                <h3 className={styles.cardTitle} title={f.title}>{f.title}</h3>
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
