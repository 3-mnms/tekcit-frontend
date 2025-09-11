// src/components/festival/main/CategorySection.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import styles from './CategorySection.module.css'
import { getFestivals } from '@/shared/api/festival/festivalApi'
import type { Festival } from '@/models/festival/festivalType'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getFestivalsByCategory, type PageResp } from '@/shared/api/festival/FestivalApi'
import { useCategorySelection } from '@/shared/storage/useCategorySelection'

/* ───────────────────────── 유틸 ───────────────────────── */
const canon = (s?: string) =>
  (s ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[()（）]/g, (m) => (m === '(' || m === '（' ? '(' : ')'))

// 메인에서는 5개만
const MAX_MAIN_ITEMS = 5

/** 원본 -> 그룹 */
const CATEGORY_MAP: Record<string, string> = {
  대중음악: '대중음악',
  대중무용: '무용',
  '무용(서양/한국무용)': '무용',
  뮤지컬: '뮤지컬/연극',
  연극: '뮤지컬/연극',
  '서양음악(클래식)': '클래식/국악',
  '한국음악(국악)': '클래식/국악',
  '서커스/마술': '서커스/마술',
}
const normalizeGroup = (o?: string) => (o ? (CATEGORY_MAP[canon(o)] ?? '복합') : '복합')

/** 메인 상단 탭 */
const GROUP_TABS = [
  '대중음악',
  '무용',
  '뮤지컬/연극',
  '클래식/국악',
  '서커스/마술',
  '복합',
] as const

/** slug -> 그룹(한글) */
const SLUG_TO_GROUP: Record<string, string> = {
  pop: '대중음악',
  dance: '무용',
  theater: '뮤지컬/연극',
  classic: '클래식/국악',
  magic: '서커스/마술',
  mix: '복합',
}

/** 포스터 URL 보정 */
const buildPosterUrl = (f: any): string => {
  const raw = f?.poster ?? f?.poster_file ?? f?.posterFile ?? f?.posterUrl ?? ''
  if (!raw) return ''
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw.replace(/^http:\/\//i, 'https://')
  }
  const path = raw.startsWith('/') ? raw : `/${raw}`
  return `https://www.kopis.or.kr${encodeURI(path)}`
}

// 카드/갭(⚠ CSS와 맞추기)
const CARD_MAX = 220 // px
const GAP = 45 // px (= 1.5rem)

type PagerProps = {
  page: number // 1-based
  totalPages: number
  onChange: (next: number) => void
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

const Pager: React.FC<PagerProps> = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null

  // 페이지 버튼 리스트 생성(현재 기준 +/-2, 양 끝 포함, 중간 점프 …)
  const makePages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)

    if (page <= 3) return [1, 2, 3, 4, 5] // 앞쪽
    if (page >= totalPages - 2)
      // 뒤쪽
      return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]

    // 가운데: 현재 페이지를 중심으로 5개
    return [page - 2, page - 1, page, page + 1, page + 2].map((p) => clamp(p, 1, totalPages))
  }

  const items = makePages()

  return (
    <nav className={styles.pagination} aria-label="페이지 네비게이션">
      <button
        type="button"
        className={styles.pageNav}
        onClick={() => onChange(1)}
        disabled={page === 1}
        aria-label="첫 페이지"
      >
        «
      </button>

      <button
        type="button"
        className={styles.pageNav}
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="이전 페이지"
      >
        ‹
      </button>

      <ul className={styles.pageList}>
        {items.map((num) => (
          <li key={num}>
            <button
              type="button"
              className={`${styles.pageBtn} ${page === num ? styles.active : ''}`}
              onClick={() => onChange(num)}
              aria-current={page === num ? 'page' : undefined}
            >
              {num}
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={styles.pageNav}
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="다음 페이지"
      >
        ›
      </button>

      <button
        type="button"
        className={styles.pageNav}
        onClick={() => onChange(totalPages)}
        disabled={page === totalPages}
        aria-label="마지막 페이지"
      >
        »
      </button>
    </nav>
  )
}

/* ───────────────────────── 메인 컴포넌트 ───────────────────────── */
const CategorySection: React.FC = () => {
  const { slug, name, category } = useParams<{ slug?: string; name?: string; category?: string }>()
  const rawSlug = slug ?? name ?? category ?? null
  const isCategoryPage = Boolean(rawSlug)
  const groupFromSlug = rawSlug ? (SLUG_TO_GROUP[rawSlug] ?? '복합') : undefined

  const { activeChild, setActiveChild } = useCategorySelection()

  const [festivals, setFestivals] = useState<Festival[]>([])
  const [currentGroup, setCurrentGroup] = useState<string>(groupFromSlug || GROUP_TABS[0])

  // URL ?page= 와 동기화 (1-based)
  const [searchParams, setSearchParams] = useSearchParams()
  const pageParam = parseInt(searchParams.get('page') || '1', 10)
  const page1 = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam
  const PAGE_SIZE = 15

  // ✅ 컨테이너 기준 칼럼 수(1~5) 계산
  const gridRef = useRef<HTMLDivElement | null>(null)
  const [cols, setCols] = useState<number>(5)

  // 메인용 전체 리스트 로딩
  useEffect(() => {
    ;(async () => {
      try {
        const raw = await getFestivals()
        setFestivals(raw)
      } catch (e) {
        console.error('🚨 공연 리스트 불러오기 실패', e)
      }
    })()
  }, [])

  // 슬러그로 진입 시 그룹 동기화
  useEffect(() => {
    if (groupFromSlug) setCurrentGroup(groupFromSlug)
  }, [groupFromSlug])

  const handleSelectGroup = (g: string) => setCurrentGroup(g)

  // ✅ 칼럼 수 계산
  useEffect(() => {
    const el = gridRef.current?.parentElement
    const measure = () => {
      const width =
        el?.getBoundingClientRect().width ??
        document.documentElement.clientWidth ??
        window.innerWidth
      const possible = Math.floor((width + GAP) / (CARD_MAX + GAP))
      const next = Math.max(1, Math.min(5, possible))
      setCols(next)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (el) ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  // 1) 메인(비카테고리) 탭용 리스트
  const inGroup = useMemo(
    () => festivals.filter((f) => normalizeGroup((f as any).genrenm) === currentGroup),
    [festivals, currentGroup],
  )
  const mainList = useMemo(() => inGroup.slice(0, MAX_MAIN_ITEMS), [inGroup])

  // 2) 카테고리 페이지: 하위 원본 장르 탭 목록
  const presentChildren = useMemo(() => {
    if (!isCategoryPage) return []
    const set = new Set<string>()
    festivals
      .filter((f) => normalizeGroup((f as any).genrenm) === groupFromSlug)
      .forEach((f) => set.add(canon((f as any).genrenm)))
    return Array.from(set)
  }, [isCategoryPage, festivals, groupFromSlug])

  const showChildButtons = isCategoryPage && presentChildren.length > 1

  // 3) 기본 하위 선택 세팅
  useEffect(() => {
    if (!isCategoryPage || presentChildren.length === 0) {
      setActiveChild(null)
      return
    }
    const canonList = presentChildren.map(canon)
    if (!activeChild || !canonList.includes(canon(activeChild))) {
      setActiveChild(presentChildren[0])
    }
  }, [isCategoryPage, presentChildren, activeChild, setActiveChild])

  // 4) 카테고리 페이지 전용: 페이지네이션 (QueryParam API)
  const genrenmForQuery = isCategoryPage ? (activeChild ?? undefined) : undefined
  const { data: pageResp, isLoading } = useQuery<PageResp<Festival>>({
    queryKey: ['categoryPage', genrenmForQuery, page1, PAGE_SIZE],
    enabled: !!genrenmForQuery,
    queryFn: ({ signal }) => getFestivalsByCategory(genrenmForQuery!, page1 - 1, PAGE_SIZE, signal),
    keepPreviousData: true,
    staleTime: 60_000,
  })

  // 최종 렌더 목록
  const displayed = useMemo(() => {
    if (!isCategoryPage) return mainList
    return pageResp?.content ?? []
  }, [isCategoryPage, mainList, pageResp?.content])

  const totalPages = isCategoryPage ? (pageResp?.totalPages ?? 0) : 1
  const hasItems = displayed.length > 0
  const effectiveCols = Math.max(1, Math.min(cols, 5, hasItems ? displayed.length : 1))
  const sectionRef = useRef<HTMLDivElement | null>(null)

  // 부드럽게 섹션 상단으로만 스크롤 (고정 헤더가 있으면 그 높이만큼 빼도 됨)
  const scrollToSectionTop = () => {
    const el = sectionRef.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 50
    window.scrollTo({ top, behavior: 'smooth' })
  }

  const handlePageChange = (next: number) => {
    if (!isCategoryPage) return
    const safe = Math.max(1, Math.min(totalPages || 1, next))
    const sp = new URLSearchParams(searchParams)
    sp.set('page', String(safe))
    setSearchParams(sp, { replace: false })
    scrollToSectionTop() // ← 여기!
  }

  useEffect(() => {
    if (!isCategoryPage) return
    const sp = new URLSearchParams(searchParams)
    if (sp.get('page') !== '1') {
      sp.set('page', '1')
      setSearchParams(sp, { replace: true })
    }
    scrollToSectionTop() // ← 여기!
  }, [genrenmForQuery])

  return (
    <section ref={sectionRef} className={styles.section}>
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

        {/* 카테고리 페이지: 하위 원본 장르 탭 (2개 이상일 때만) */}
        {showChildButtons && (
          <div className={styles.tabList}>
            {presentChildren.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActiveChild(c)}
                className={`${styles.tabButton} ${canon(activeChild) === canon(c) ? styles.active : ''}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 카드 그리드 */}
      <div
        className={styles.cardSlider}
        ref={gridRef}
        style={{
          ['--cols' as any]: effectiveCols,
          ['--gap' as any]: `${GAP}px`,
        }}
      >
        {isLoading && isCategoryPage && !pageResp?.content?.length ? (
          // 첫 로드 스켈레톤 (선택)
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`${styles.card} ${styles.skeletonCard}`} />
          ))
        ) : hasItems ? (
          displayed.map((festival, idx) => {
            const posterSrc = buildPosterUrl(festival)
            const fid =
              (festival as any).fid ?? (festival as any).mt20id ?? (festival as any).id ?? null

            const key = `${fid ?? 'unknown'}-${idx}`
            const title = festival.prfnm
            const poster = posterSrc || '@/shared/assets/placeholder-poster.png'

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
                          ;(e.currentTarget as HTMLImageElement).src =
                            '@/shared/assets/placeholder-poster.png'
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
                          ;(e.currentTarget as HTMLImageElement).src =
                            '@/shared/assets/placeholder-poster.png'
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
            )
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

      {/* ✅ 페이지네이션 (그리드 아래) */}
      {isCategoryPage && totalPages > 1 && (
        <div className={styles.pagerWrap}>
          <Pager page={page1} totalPages={totalPages} onChange={handlePageChange} />
        </div>
      )}
    </section>
  )
}

export default CategorySection
