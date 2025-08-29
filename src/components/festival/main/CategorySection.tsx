import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './CategorySection.module.css';
import { getFestivals } from '@/shared/api/festival/festivalApi';
import type { Festival } from '@/models/festival/festivalType';
import { useParams, Link } from 'react-router-dom';

// 문자열 정규화
const canon = (s?: string) =>
  (s ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[()（）]/g, (m) => (m === '(' || m === '（' ? '(' : ')'));

// 💡 메인에서는 5개만!
const MAX_MAIN_ITEMS = 5;

/** 원본 -> 그룹 */
const CATEGORY_MAP: Record<string, string> = {
  '대중음악': '대중음악',
  '대중무용': '무용',
  '무용(서양/한국무용)': '무용',
  '뮤지컬': '뮤지컬/연극',
  '연극': '뮤지컬/연극',
  '서양음악(클래식)': '클래식/국악',
  '한국음악(국악)': '클래식/국악',
  '서커스/마술': '서커스/마술',
};
const normalizeGroup = (o?: string) => (o ? (CATEGORY_MAP[canon(o)] ?? '복합') : '복합');

/** 메인 상단 탭 */
const GROUP_TABS = ['대중음악','무용','뮤지컬/연극','클래식/국악','서커스/마술','복합'] as const;

/** 슬러그 -> 그룹 */
const SLUG_TO_GROUP: Record<string, string> = {
  pop: '대중음악',
  dance: '무용',
  theater: '뮤지컬/연극',
  classic: '클래식/국악',
  magic: '서커스/마술',
  mix: '복합',
};

/** 🔧 포스터 URL 보정 */
const buildPosterUrl = (f: any): string => {
  const raw = f?.poster ?? f?.poster_file ?? f?.posterFile ?? f?.posterUrl ?? '';
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw.replace(/^http:\/\//i, 'https://');
  }
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `https://www.kopis.or.kr${encodeURI(path)}`;
};

// 💡 카드/갭(⚠ CSS와 맞추기)
const CARD_MAX = 220; // px (카드 최대폭)
const GAP = 45;       // px (= 1.5rem)

const CategorySection: React.FC = () => {
  const { slug, name, category } = useParams<{ slug?: string; name?: string; category?: string }>();
  const rawSlug = slug ?? name ?? category ?? null;
  const isCategoryPage = Boolean(rawSlug);
  const groupFromSlug = rawSlug ? (SLUG_TO_GROUP[rawSlug] ?? '복합') : undefined;

  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [currentGroup, setCurrentGroup] = useState<string>(groupFromSlug || GROUP_TABS[0]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  // ✅ 컨테이너 기준 칼럼 수(1~5) 계산
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [cols, setCols] = useState<number>(5);

  useEffect(() => {
    (async () => {
      try {
        const raw = await getFestivals();
        setFestivals(raw);
      } catch (e) {
        console.error('🚨 공연 리스트 불러오기 실패', e);
      }
    })();
  }, []);

  // 슬러그로 진입 시 그룹 동기화
  useEffect(() => {
    if (groupFromSlug) {
      setCurrentGroup(groupFromSlug);
      setSelectedChild(null);
    }
  }, [groupFromSlug]);

  const handleSelectGroup = (g: string) => {
    setCurrentGroup(g);
    setSelectedChild(null);
  };

  // ✅ 칼럼 수 계산(상위 컨테이너 너비 기준, 1~5로 clamp)
  useEffect(() => {
    const el = gridRef.current?.parentElement; // grid보다 한 단계 위 컨테이너 기준
    const measure = () => {
      const width =
        el?.getBoundingClientRect().width ??
        document.documentElement.clientWidth ??
        window.innerWidth;
      const possible = Math.floor((width + GAP) / (CARD_MAX + GAP));
      const next = Math.max(1, Math.min(5, possible));
      setCols(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (el) ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  // 1) 현재 그룹 데이터
  const inGroup = useMemo(
    () => festivals.filter((f) => normalizeGroup((f as any).genrenm) === currentGroup),
    [festivals, currentGroup]
  );

  // 2) 하위(원본) 목록을 "데이터에서" 추출
  const presentChildren = useMemo(() => {
    const set = new Set<string>();
    inGroup.forEach((f) => {
      const raw = (f as any).genrenm as string | undefined;
      if (raw) set.add(canon(raw));
    });
    return Array.from(set);
  }, [inGroup]);

  // 3) 버튼 노출 여부 (카테고리 페이지 && 하위 2개 이상)
  const showChildButtons = isCategoryPage && presentChildren.length > 1;

  // 4) 하위 자동 선택: 카테고리 페이지에서만
  useEffect(() => {
    if (!isCategoryPage) {
      if (selectedChild !== null) setSelectedChild(null);
      return;
    }
    if (showChildButtons) {
      if (!selectedChild || !presentChildren.includes(canon(selectedChild))) {
        setSelectedChild(presentChildren[0] ?? null);
      }
    } else {
      if (selectedChild !== null) setSelectedChild(null);
    }
  }, [isCategoryPage, showChildButtons, presentChildren, selectedChild]);

  // 5) 최종 리스트 (카테고리 페이지에서만 하위 필터 적용)
  const finalList = useMemo(() => {
    const base =
      isCategoryPage && showChildButtons && selectedChild
        ? inGroup.filter((f) => canon((f as any).genrenm) === canon(selectedChild))
        : inGroup;
    return base;
  }, [inGroup, isCategoryPage, showChildButtons, selectedChild]);

  // ✅ 메인(비카테고리)에서는 5개만, 카테고리 페이지에서는 전체
  const displayed = useMemo(
    () => (isCategoryPage ? finalList : finalList.slice(0, MAX_MAIN_ITEMS)),
    [finalList, isCategoryPage]
  );

  const hasItems = displayed.length > 0;

  // ✅ 실제 그릴 칼럼 수 = min(컨테이너 cols, 5, 아이템 수) — 최소 1칸은 유지(빈카드 자리)
  const effectiveCols = Math.max(1, Math.min(cols, 5, hasItems ? displayed.length : 1));

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.title}>분야별 공연</h2>

        {/* 메인: 상위 그룹 탭 */}
        {!isCategoryPage && (
          <div className={styles.tabList}>
            {GROUP_TABS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => handleSelectGroup(g)}
                className={`${styles.tabButton} ${currentGroup === g ? styles.active : ''}`}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        {/* 카테고리 페이지: 하위 버튼 (2개 이상일 때만) */}
        {showChildButtons && (
          <div className={styles.tabList}>
            {presentChildren.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedChild((prev) => (canon(prev) === c ? null : c))}
                className={`${styles.tabButton} ${canon(selectedChild) === c ? styles.active : ''}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ✅ 여러 줄 허용 · 한 줄 최대 5칸 · 가운데 정렬 + 빈 상태 오버레이 */}
      <div
        className={styles.cardSlider}
        ref={gridRef}
        style={{
          ['--cols' as any]: effectiveCols, // 1~5 & 아이템 수/자리 유지 반영
          ['--gap'  as any]: `${GAP}px`,
        }}
      >
        {hasItems ? (
          displayed.map((festival, idx) => {
            const posterSrc = buildPosterUrl(festival);
            const fid =
              (festival as any).fid ??
              (festival as any).mt20id ??
              (festival as any).id ??
              null;

            const key = `${fid ?? 'unknown'}-${idx}`;
            const title = festival.prfnm;
            const poster = posterSrc || '/assets/placeholder-poster.png';

            return (
              <div key={key} className={styles.card}>
                {fid ? (
                  <Link
                    to={`/festival/${fid}`}
                    state={{ fid, title, poster }}
                    className={styles.cardLink}
                    aria-label={`${title} 상세보기`}
                  >
                    <div className={styles.imageWrapper}>
                      <img
                        src={poster}
                        alt={title}
                        className={styles.image}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/assets/placeholder-poster.png';
                        }}
                      />
                    </div>
                    <h3 className={styles.name}>{title}</h3>
                    <p className={styles.date}>
                      {festival.prfpdfrom === festival.prfpdto
                        ? festival.prfpdfrom
                        : `${festival.prfpdfrom} ~ ${festival.prfpdto}`}
                    </p>
                    <p className={styles.location}>{(festival as any).fcltynm}</p>
                  </Link>
                ) : (
                  <div className={styles.cardStatic} title="상세 이동 불가: 식별자 없음">
                    <div className={styles.imageWrapper}>
                      <img
                        src={poster}
                        alt={title}
                        className={styles.image}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/assets/placeholder-poster.png';
                        }}
                      />
                    </div>
                    <h3 className={styles.name}>{title}</h3>
                    <p className={styles.date}>
                      {festival.prfpdfrom === festival.prfpdto
                        ? festival.prfpdfrom
                        : `${festival.prfpdfrom} ~ ${festival.prfpdto}`}
                    </p>
                    <p className={styles.location}>{(festival as any).fcltynm}</p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <>
            {/* 자리를 유지하는 투명 카드 1개 */}
            <div className={`${styles.card} ${styles.emptyCard}`} aria-hidden />

            {/* 전체 폭 중앙 한 줄 오버레이 문구 */}
            <div className={styles.emptyOverlay} aria-live="polite">
              <span className={styles.emptyOverlayText}>현재 예매 가능한 공연이 없습니다.</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default CategorySection;
