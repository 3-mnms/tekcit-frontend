import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchFestivals } from '@/shared/api/festival/searchApi';
import type { FestivalItem } from '@/models/festival/festivalSearchTypes';
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

const fixPoster = (raw?: string) => {
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw.replace(/^http:\/\//i, 'https://');
  }
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `https://www.kopis.or.kr${encodeURI(path)}`;
};

const ResultPanel: React.FC = () => {
  const [params] = useSearchParams();
  const keyword = (params.get('keyword') || '').trim();

  const selectedGenres = (params.get('genres') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const selectedStatus = (
    params.get('status') || DEFAULT_STATUSES.join(',')
  )
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean) as Sale[];

  const fromParam = params.get('from') || undefined;
  const toParam = params.get('to') || undefined;

  const genreForBackend = selectedGenres.length === 1 ? selectedGenres[0] : undefined;

  const { data = [], isLoading, isError } = useQuery<FestivalItem[]>({
    queryKey: ['searchResults', { keyword, genreForBackend }],
    // ✅ 404를 '결과 없음'으로 처리
    queryFn: async () => {
      try {
        const res = await searchFestivals({
          keyword: keyword || undefined,
          genre: genreForBackend,
        });
        return Array.isArray(res) ? res : [];
      } catch (e: any) {
        if (e?.response?.status === 404) return []; // <- 핵심
        throw e;
      }
    },
    enabled: !!keyword || !!selectedGenres.length,
    staleTime: 60_000,
    keepPreviousData: true,
    retry: (failureCount, error: any) =>
      error?.response?.status === 404 ? false : failureCount < 2, // 404는 재시도 불필요
  });

  const filtered = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const fromD = parseDate(fromParam);
    const toD = parseDate(toParam) ?? fromD;

    return list.filter((item) => {
      // 장르 필터
      if (selectedGenres.length && (!item.genrenm || !selectedGenres.includes(item.genrenm))) {
        return false;
      }
      // 상태 필터
      const sale = computeSale(item.prfpdfrom, item.prfpdto);
      if (selectedStatus.length && (!sale || !selectedStatus.includes(sale))) {
        return false;
      }
      // 날짜 범위 필터
      if (fromD) {
        const s = parseDate(item.prfpdfrom);
        const e = parseDate(item.prfpdto) ?? s;
        if (!s) return false;
        const rangeTo = toD ?? fromD;
        const overlap = (e ?? s) >= fromD && s <= (rangeTo ?? fromD);
        if (!overlap) return false;
      }
      return true;
    });
  }, [data, selectedGenres, selectedStatus, fromParam, toParam]);

  const [visibleCount, setVisibleCount] = useState(CHUNK);
  useEffect(() => {
    setVisibleCount(CHUNK);
  }, [keyword, selectedGenres.join(','), selectedStatus.join(','), fromParam, toParam]);

  const total = filtered.length;
  const itemsToShow = filtered.slice(0, visibleCount);
  const canLoadMore = visibleCount < total;

  if (!keyword && !selectedGenres.length)
    return <div className={styles.message}>검색어 또는 장르를 선택해 주세요.</div>;

  if (isLoading) return <div className={styles.message}>로딩 중…</div>;

  // 이제 여기까지 내려오면, 404는 data=[]로 처리되어 isError=false 상태!
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
            {itemsToShow.map((f) => {
              const poster = fixPoster(f.poster);
              const to = f.fid ? `/festival/${f.fid}` : undefined;

              const dateRange = f.prfpdfrom
                ? f.prfpdto && f.prfpdto.slice(0, 10) !== f.prfpdfrom.slice(0, 10)
                  ? `${f.prfpdfrom} ~ ${f.prfpdto}`
                  : f.prfpdfrom
                : undefined;

              const CardInner = (
                <>
                  {poster && (
                    <img
                      src={poster}
                      alt={f.prfnm}
                      className={styles.poster}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          '/placeholder-poster.png'; // 프로젝트의 정적 경로로 교체 가능
                      }}
                    />
                  )}
                  <h3 className={styles.cardTitle} title={f.prfnm}>
                    {f.prfnm}
                  </h3>
                  {f.fcltynm && <p className={styles.venue}>{f.fcltynm}</p>}
                  {dateRange && <p className={styles.date}>{dateRange}</p>}
                </>
              );

              return (
                <article key={f.fid} className={styles.card}>
                  {to ? (
                    <Link
                      to={to}
                      state={{
                        fid: f.fid,
                        title: f.prfnm,
                        poster,
                        prfpdfrom: f.prfpdfrom,
                        prfpdto: f.prfpdto,
                        fcltynm: f.fcltynm,
                      }}
                      className={styles.cardLink}
                      aria-label={`${f.prfnm} 상세보기`}
                    >
                      {CardInner}
                    </Link>
                  ) : (
                    <div className={styles.cardStatic} title="상세 이동 불가: 식별자 없음">
                      {CardInner}
                    </div>
                  )}
                </article>
              );
            })}
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
