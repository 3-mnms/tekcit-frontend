import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchFestivals } from '@shared/api/festival/SearchApi';
import type { FestivalItem } from '@/models/festival/FestivalSearchTypes';
import styles from './ResultPanel.module.css';

const CHUNK = 6;

// 판매상태 추정
type Sale = '공연중' | '공연예정' | '공연종료' | undefined;

const parseDate = (s?: string) => {
  if (!s) return undefined;
  const d = new Date(s.slice(0, 10)); // YYYY-MM-DD
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

// 응답 정규화(필터용 필드 포함)
type Normalized = FestivalItem & {
  startRaw?: string;
  endRaw?: string;
  genreName?: string;
  sale?: Sale;
  venue?: string;
  poster?: string;
  dateRange?: string;
  title?: string;
  id?: string | number;
};

const normalize = (raw: any, idx: number): Normalized => {
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

  const sameDay = (a?: string, b?: string) => !!a && !!b && a.slice(0, 10) === b.slice(0, 10);
  const dateRange =
    raw?.dateRange ??
    (start ? (end && !sameDay(start, end) ? `${start} ~ ${end}` : start) : undefined);

  const genreName = raw?.genrenm ?? raw?.genre ?? raw?.category ?? raw?.festivalDetail?.genreName;

  const sale = computeSale(start, end);

  return { id, title, poster, venue, dateRange, startRaw: start, endRaw: end, genreName, sale };
};

const ResultPanel: React.FC = () => {
  const [params] = useSearchParams();

  const keyword = (params.get('keyword') || '').trim();

  // ⬇️ 쿼리 파라미터 읽기 (status!)
  const selectedGenres = (params.get('genres') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const selectedStatus = (params.get('status') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean) as Sale[];

  const fromParam = params.get('from') || undefined;
  const toParam = params.get('to') || undefined;

  // 백엔드 최적화: 장르가 1개일 때만 genre 파라미터로 전달
  const genreForBackend = selectedGenres.length === 1 ? selectedGenres[0] : undefined;

  const { data, isLoading, isError } = useQuery<any[]>({
    queryKey: ['searchResults', { keyword, genreForBackend }],
    queryFn: () => searchFestivals({ keyword: keyword || undefined, genre: genreForBackend }),
    enabled: !!keyword || !!selectedGenres.length, // 키워드 or 장르 선택 시 조회
    staleTime: 60_000,
    keepPreviousData: true,
  });

  // 정규화
  const normalized: Normalized[] = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    return list.map((r, i) => normalize(r, i));
  }, [data]);

  // 클라 사이드 필터링
  const filtered: Normalized[] = useMemo(() => {
    const fromD = parseDate(fromParam);
    const toD = parseDate(toParam) ?? fromD;

    return normalized.filter((item) => {
      // 장르
      if (selectedGenres.length) {
        if (!item.genreName || !selectedGenres.includes(item.genreName)) return false;
      }

      // 상태
      if (selectedStatus.length) {
        if (!item.sale || !selectedStatus.includes(item.sale)) return false;
      }

      // 기간 overlap
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

  // 더보기
  const [visibleCount, setVisibleCount] = useState(CHUNK);
  useEffect(() => {
    setVisibleCount(CHUNK);
  }, [keyword, selectedGenres.join(','), selectedStatus.join(','), fromParam, toParam]);

  const total = filtered.length;
  const itemsToShow = filtered.slice(0, visibleCount);
  const canLoadMore = visibleCount < total;

  if (!keyword && !selectedGenres.length) {
    return <div className={styles.message}>검색어 또는 장르를 선택해 주세요.</div>;
  }
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
