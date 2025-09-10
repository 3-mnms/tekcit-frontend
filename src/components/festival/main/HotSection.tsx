import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './HotSection.module.css';
import type { Festival } from '@/models/festival/festivalType';
import { getFestivals } from '@/shared/api/festival/festivalApi';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/* ───────────────────────── 카테고리 매핑 ───────────────────────── */
const slugToCategory: Record<string, string> = {
  pop: '대중음악',
  dance: '무용',
  theater: '뮤지컬/연극',
  classic: '클래식/국악',
  magic: '서커스/마술',
  mix: '복합',
};

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

/* 포스터 URL 보정(절대경로/https 강제) */
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

/* ───────────────────────── 컴포넌트 ───────────────────────── */
const HotSection: React.FC = () => {
  const { name: slug } = useParams<{ name?: string }>();

  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveringBar, setHoveringBar] = useState(false);

  // 모바일(hover 없음) 감지 → 모바일에선 썸네일 스트립 항상 노출
  const isCoarsePointer = useRef<boolean>(false);
  useEffect(() => {
    isCoarsePointer.current = window.matchMedia('(pointer:coarse)').matches;
  }, []);

  const selectedCategory = useMemo(
    () => (slug ? slugToCategory[slug] ?? null : null),
    [slug]
  );

  // 데이터 로드: /festival 자체가 조회수 내림차순 정렬
  useEffect(() => {
    const fetchData = async () => {
      try {
        const list = await getFestivals();
        setFestivals(list);
      } catch (err) {
        console.error('🔥 Hot 공연 불러오기 실패', err);
        setFestivals([]);
      }
    };
    fetchData();
  }, []);

  // 카테고리 필터
  const filtered = useMemo(() => {
    if (!selectedCategory) return festivals;
    return festivals.filter(
      (f) => normalizeCategory((f as any).genrenm) === selectedCategory
    );
  }, [festivals, selectedCategory]);

  // 상단 히어로 & 썸네일에 쓸 상위 10개만
  const items = useMemo(() => filtered.slice(0, 10), [filtered]);
  const hasItems = items.length > 0;

  // 현재 아이템
  const current = hasItems ? items[currentIndex] : undefined;
  const currentPoster = current ? buildPosterUrl(current) : '';

  // 접근성: 좌/우 방향키로 이동
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!hasItems) return;
      if (e.key === 'ArrowRight') {
        setCurrentIndex((p) => (p + 1) % items.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((p) => (p - 1 + items.length) % items.length);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hasItems, items.length]);

  const goPrev = () => setCurrentIndex(p => (p - 1 + items.length) % items.length);
  const goNext = () => setCurrentIndex(p => (p + 1) % items.length);


  return (
    <section className={styles.section}>
      {/* ✅ 배경 이미지 레이어 */}
      {hasItems && (
        <motion.img
          key={currentPoster} // 포스터가 바뀔 때마다 다시 그려짐
          src={currentPoster || '@/shared/assets/placeholder-poster.png'}
          alt=""
          aria-hidden="true"
          className={styles.bgImage}
          referrerPolicy="no-referrer"
          draggable={false}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28 }}
        />
      )}

      {/* ✅ 배경 위 오버레이 */}
      <div className={styles.bgOverlay} />

      <h2 className={styles.title}>
        {selectedCategory ? `${selectedCategory} HOT 공연` : '오늘의 HOT 공연'}
      </h2>

      {/* 히어로 카드 */}
      {hasItems ? (
        <motion.div
          key={current?.fid ?? currentIndex}
          className={styles.hero}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          aria-live="polite"
        >
          <Link
            to={`/festival/${current?.fid}`}
            state={{
              fid: current?.fid,
              title: current?.prfnm,
              poster: currentPoster || '@/shared/assets/placeholder-poster.png',
              prfpdfrom: current?.prfpdfrom,
              prfpdto: current?.prfpdto,
              fcltynm: current?.fcltynm,
            }}
            className={styles.heroLink}
            aria-label={`${current?.prfnm} 상세보기`}
          >
            <div className={styles.heroPoster}>
              <img
                src={currentPoster || '@/shared/assets/placeholder-poster.png'}
                alt={current?.prfnm}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    '@/shared/assets/placeholder-poster.png';
                }}
                referrerPolicy="no-referrer"
                draggable={false}
              />
              <span className={styles.rankPill}>{currentIndex + 1}</span>
            </div>
          </Link>
        </motion.div>
      ) : (
        <div className={styles.empty}>현재 예매 가능한 공연이 없습니다.</div>
      )}

      {/* 좌우 화살표 */}
      {hasItems && (
        <>
          <motion.button
            type="button"
            className={`${styles.arrow} ${styles.arrowLeft}`}
            onClick={goPrev}
            whileTap={{ scale: 0.95 }}
            aria-label="이전 포스터"
          >
            <svg className={styles.arrowIcon} viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M15.5 19.5L8.5 12l7-7.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>

          <motion.button
            type="button"
            className={`${styles.arrow} ${styles.arrowRight}`}
            onClick={goNext}
            whileTap={{ scale: 0.95 }}
            aria-label="다음 포스터"
          >
            <svg className={styles.arrowIcon} viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M8.5 4.5L15.5 12l-7 7.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>

          {/* 하단 바 */}
          <div
            className={styles.bottomBar}
            onMouseEnter={() => setHoveringBar(true)}
            onMouseLeave={() => setHoveringBar(false)}
            style={
              {
                '--segments': items.length,
                '--index': currentIndex,
              } as React.CSSProperties
            }
          >
            <AnimatePresence>
              {(hoveringBar || isCoarsePointer.current) && (
                <motion.div
                  className={styles.thumbLayer}
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 16, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  {items.map((f, i) => {
                    const src = buildPosterUrl(f);
                    const isActive = i === currentIndex;
                    return (
                      <button
                        type="button"
                        key={`${f.fid ?? i}`}
                        className={`${styles.thumbBtn} ${isActive ? styles.activeThumb : ''
                          }`}
                        onClick={() => setCurrentIndex(i)}
                        aria-label={`${i + 1}위 포스터로 이동`}
                      >
                        <img
                          src={src || '@/shared/assets/placeholder-poster.png'}
                          alt={f.prfnm}
                          className={styles.thumb}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              '@/shared/assets/placeholder-poster.png';
                          }}
                          referrerPolicy="no-referrer"
                          draggable={false}
                        />
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            <div className={styles.barTrack} />
            <div className={styles.barIndicator} />
            <span className={styles.pageText}>
              {currentIndex + 1}/{items.length}
            </span>
          </div>
        </>
      )}
    </section>
  );

};

export default HotSection;
