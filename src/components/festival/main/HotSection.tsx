import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './HotSection.module.css';
import type { Festival } from '@/models/festival/festivalType';
import { getFestivals } from '@/shared/api/festival/festivalApi';
import { useParams, Link } from 'react-router-dom';

// 라우트 슬러그 -> 그룹 카테고리
const slugToCategory: Record<string, string> = {
  pop: '대중음악',
  dance: '무용',
  theater: '뮤지컬/연극',
  classic: '클래식/국악',
  magic: '서커스/마술',
  mix: '복합',
};

// 원본 카테고리 -> 그룹 카테고리
const CATEGORY_MAP: Record<string, string> = {
  '대중무용': '무용',
  '무용(서양/한국무용)': '무용',
  '대중음악': '대중음악',
  '뮤지컬': '뮤지컬/연극',
  '연극': '뮤지컬/연극',
  '서양음악(클래식)': '클래식/국악',
  '한국음악(국악)': '클래식/국악',
  '서커스/마술': '서커스/마술',
};

const normalizeCategory = (original?: string): string =>
  original ? (CATEGORY_MAP[original] ?? '복합') : '복합';

// 포스터 URL 보정(절대경로/https 강제)
const buildPosterUrl = (f: Partial<Festival>): string => {
  const raw =
    (f as any)?.poster ??
    (f as any)?.poster_file ??
    (f as any)?.posterFile ??
    (f as any)?.posterUrl ??
    '';
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw.replace(/^http:\/\//i, 'https://');
  }
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `https://www.kopis.or.kr${encodeURI(path)}`;
};

// 카드 최대 너비(px) — CSS .card max-width 와 반드시 동일
const CARD_MAX = 220;
const GAP = 24; // 1.5rem

const HotSection: React.FC = () => {
  const { name: slug } = useParams<{ name?: string }>();
  const [festivals, setFestivals] = useState<Festival[]>([]);

  // 🔑 칼럼 수는 section(상위 컨테이너)의 실제 너비로 계산
  const sectionRef = useRef<HTMLElement | null>(null);
  const [cols, setCols] = useState(5);

  const selectedCategory = useMemo(
    () => (slug ? slugToCategory[slug] ?? null : null),
    [slug]
  );

  // 상위 컨테이너 폭 기준으로 1~5 칼럼 산정 (겹침/유령칼럼 방지)
  useEffect(() => {
    const el = sectionRef.current;
    const updateCols = () => {
      const width =
        el?.getBoundingClientRect().width ??
        document.documentElement.clientWidth ??
        window.innerWidth;

      // (cols * CARD_MAX) + (cols - 1) * GAP <= width
      const possible = Math.floor((width + GAP) / (CARD_MAX + GAP));
      const next = Math.max(1, Math.min(5, possible));
      setCols(next);
    };

    updateCols();
    const ro = new ResizeObserver(updateCols);
    if (el) ro.observe(el);
    window.addEventListener('resize', updateCols);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateCols);
    };
  }, []);

  // ✅ 데이터 로드 (/festival 자체가 조회수 내림차순 정렬)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const list = await getFestivals();
        setFestivals(list); // 이미 정렬돼서 옴!
      } catch (err) {
        console.error('🔥 Hot 공연 불러오기 실패', err);
        setFestivals([]);
      }
    };
    fetchData();
  }, []);

  // 카테고리 선택 시 필터 (정렬은 API 결과 유지)
  const filtered = useMemo(() => {
    if (!selectedCategory) return festivals;
    return festivals.filter((f) => normalizeCategory((f as any).genrenm) === selectedCategory);
  }, [festivals, selectedCategory]);

  // ✅ 실제 렌더 개수
  // - 아이템 있을 때: min(계산된 칼럼 수, 데이터 수, 5)
  // - 아이템 없을 때: 최소 1칸은 유지(placeholder 자리)
  const hasItems = filtered.length > 0;
  const count = hasItems ? Math.min(cols, filtered.length, 5) : 1;

  return (
    <section className={styles.section} ref={sectionRef}>
      <h2 className={styles.title}>
        {selectedCategory ? `${selectedCategory} HOT 공연` : '오늘의 HOT 공연'}
      </h2>

      {/* CSS 변수로 칼럼 수 동기화(유령 칼럼 방지 + 가운데 정렬) */}
      <div
        className={styles.cardList}
        style={{ ['--cols' as any]: count }}
      >
        {hasItems ? (
          filtered.slice(0, count).map((festival, index) => {
            const key = `${festival.fid || (festival as any).id || 'unknown'}-${index}`;
            const posterSrc = buildPosterUrl(festival);
            const to = festival.fid ? `/festival/${festival.fid}` : undefined;

            const CardInner = (
              <>
                <div className={styles.imageWrapper}>
                  <img
                    src={posterSrc || '@/shared/assets/placeholder-poster.png'}
                    alt={festival.prfnm}
                    className={styles.image}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '@/shared/assets/placeholder-poster.png';
                    }}
                  />
                  <span className={styles.rank}>{index + 1}</span>
                </div>
                <div className={styles.content}>
                  <h3 className={styles.name}>{festival.prfnm}</h3>
                  <p className={styles.location}>{festival.fcltynm}</p>
                  <p className={styles.date}>
                    {festival.prfpdfrom === festival.prfpdto
                      ? festival.prfpdfrom
                      : `${festival.prfpdfrom} ~ ${festival.prfpdto}`}
                  </p>
                </div>
              </>
            );

            return (
              <div key={key} className={styles.card}>
                {to ? (
                  <Link
                    to={to}
                    state={{
                      fid: festival.fid,
                      title: festival.prfnm,
                      poster: posterSrc || '@/shared/assets/placeholder-poster.png',
                      prfpdfrom: festival.prfpdfrom,
                      prfpdto: festival.prfpdto,
                      fcltynm: festival.fcltynm,
                    }}
                    className={styles.cardLink}
                    aria-label={`${festival.prfnm} 상세보기`}
                  >
                    {CardInner}
                  </Link>
                ) : (
                  <div className={styles.cardStatic} title="상세 이동 불가: 식별자 없음">
                    {CardInner}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <>
            {/* 자리 유지용 투명 카드 1개 */}
            <div className={`${styles.card} ${styles.emptyCard}`} aria-hidden />

            {/* 화면 전체에 보이는 안내 문구(카드 위 오버레이) */}
            <div className={styles.emptyOverlay} aria-live="polite">
              <span className={styles.emptyOverlayText}>
                현재 예매 가능한 공연이 없습니다.
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default HotSection;
