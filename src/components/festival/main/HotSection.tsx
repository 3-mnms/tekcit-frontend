import React, { useEffect, useMemo, useRef, useState } from 'react'
import styles from './HotSection.module.css'
import type { Festival } from '@/models/festival/festivalType'
import { getFestivals } from '@/shared/api/festival/festivalApi'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper/types'
import { Navigation, Keyboard, A11y, EffectCoverflow } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/effect-coverflow'

/* ───────────────────────── 카테고리 매핑 ───────────────────────── */
const slugToCategory: Record<string, string> = {
  pop: '대중음악',
  dance: '무용',
  theater: '뮤지컬/연극',
  classic: '클래식/국악',
  magic: '서커스/마술',
  mix: '복합',
}

const CATEGORY_MAP: Record<string, string> = {
  대중무용: '무용',
  '무용(서양/한국무용)': '무용',
  대중음악: '대중음악',
  뮤지컬: '뮤지컬/연극',
  연극: '뮤지컬/연극',
  '서양음악(클래식)': '클래식/국악',
  '한국음악(국악)': '클래식/국악',
  '서커스/마술': '서커스/마술',
}

const normalizeCategory = (original?: string): string =>
  original ? (CATEGORY_MAP[original] ?? '복합') : '복합'

/* 포스터 URL 보정(절대경로/https 강제) */
const buildPosterUrl = (f: Partial<Festival>): string => {
  const raw = (f as any)?.poster ?? ''
  if (!raw) return ''
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw.replace(/^http:\/\//i, 'https://')
  }
  const path = raw.startsWith('/') ? raw : `/${raw}`
  return `https://www.kopis.or.kr${encodeURI(path)}`
}

/* ───────────────────────── 컴포넌트 ───────────────────────── */
const HotSection: React.FC = () => {
  const { name: slug } = useParams<{ name?: string }>()

  const [festivals, setFestivals] = useState<Festival[]>([])
  const [hoveringBar, setHoveringBar] = useState(false)

  // Swiper 제어/상태
  const swiperRef = useRef<SwiperType | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0) // 활성(가운데) 슬라이드의 "원본 배열" 인덱스

  // 모바일(hover 없음) 감지 → 모바일에선 썸네일 스트립 항상 노출
  const isCoarsePointer = useRef<boolean>(false)
  useEffect(() => {
    isCoarsePointer.current = window.matchMedia('(pointer:coarse)').matches
  }, [])

  const selectedCategory = useMemo(() => (slug ? (slugToCategory[slug] ?? null) : null), [slug])

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        const list = await getFestivals()
        setFestivals(list)
      } catch (err) {
        console.error('🔥 Hot 공연 불러오기 실패', err)
        setFestivals([])
      }
    }
    fetchData()
  }, [])

  // 카테고리 필터 → 상위 10개
  const items = useMemo(() => {
    const base = selectedCategory
      ? festivals.filter((f) => normalizeCategory((f as any).genrenm) === selectedCategory)
      : festivals
    return base.slice(0, 10)
  }, [festivals, selectedCategory])

  const hasItems = items.length > 0

  // 배경 포스터 = 활성(가운데) 슬라이드 포스터
  const bgPoster = hasItems ? buildPosterUrl(items[currentIndex]) : ''

  // 키보드 좌우 화살표
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!hasItems || !swiperRef.current) return
      if (e.key === 'ArrowRight') {
        swiperRef.current.slideNext()
      } else if (e.key === 'ArrowLeft') {
        swiperRef.current.slidePrev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hasItems])

  const goPrev = () => swiperRef.current?.slidePrev()
  const goNext = () => swiperRef.current?.slideNext()

  return (
    <section className={styles.section}>
      {/* ✅ 배경: 가운데 카드 포스터 */}
      {hasItems && (
        <motion.img
          key={bgPoster}
          src={bgPoster || '@/shared/assets/placeholder-poster.png'}
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

      {/* ✅ 배경 오버레이 */}
      <div className={styles.bgOverlay} />

      <h2 className={styles.title}>
        {selectedCategory ? `${selectedCategory} HOT 공연` : '오늘의 HOT 공연'}
      </h2>

      {/* ✅ 5장 Swiper 캐러셀 */}
      {hasItems ? (
        <div className={styles.carouselWrap} aria-live="polite">
          <Swiper
            modules={[Navigation, Keyboard, A11y, EffectCoverflow]} // ⬅️ 추가
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={5}
            initialSlide={Math.floor(10 / 2 - 2)}
            coverflowEffect={{
              rotate: 10,
              stretch: 40,
              depth: 80,
              modifier: -1,
              slideShadows: false,
            }}
            spaceBetween={24}
            loop
            keyboard={{ enabled: true }}
            navigation={{ nextEl: '.swiper-next', prevEl: '.swiper-prev' }}
            breakpoints={{
              0: { slidesPerView: 3, spaceBetween: 12, centeredSlides: true },
              768: { slidesPerView: 5, spaceBetween: 20, centeredSlides: true },
              1024: { slidesPerView: 5, spaceBetween: 24, centeredSlides: true },
            }}
            onSwiper={(sw) => {
              swiperRef.current = sw
              setCurrentIndex(sw.realIndex) // 초기 활성 인덱스
            }}
            onSlideChange={(sw) => {
              setCurrentIndex(sw.realIndex) // 루프 환경에서도 원본 배열 인덱스
            }}
            className={styles.heroSwiper}
          >
            {items.map((f, i) => {
              const poster = buildPosterUrl(f)
              const isActive = i === currentIndex

              const handleClick = (e: React.MouseEvent) => {
                if (isActive) {
                  // 가운데 카드일 때만 링크 이동 허용
                  return
                } else {
                  e.preventDefault()
                  swiperRef.current?.slideToLoop(i, 400) // 옆 카드 눌렀을 땐 가운데로
                }
              }

              return (
                <SwiperSlide key={f.fid ?? i} className={styles.slide}>
                  <Link
                    to={isActive ? `/festival/${f.fid}` : '#'} // 가운데만 상세 경로
                    onClick={handleClick}
                    state={
                      isActive
                        ? {
                            fid: f.fid,
                            title: f.prfnm,
                            poster: poster || '@/shared/assets/placeholder-poster.png',
                            prfpdfrom: f.prfpdfrom,
                            prfpdto: f.prfpdto,
                            fcltynm: f.fcltynm,
                          }
                        : undefined
                    }
                    className={styles.cardLink}
                    aria-label={`${f.prfnm} 상세보기`}
                  >
                    <div
                      className={`${styles.cardPoster} ${isActive ? styles.isCenter : styles.isSide}`}
                    >
                      <img
                        src={poster || '@/shared/assets/placeholder-poster.png'}
                        alt={f.prfnm}
                        onError={(e) => {
                          ;(e.currentTarget as HTMLImageElement).src =
                            '@/shared/assets/placeholder-poster.png'
                        }}
                        referrerPolicy="no-referrer"
                        draggable={false}
                      />
                      <span className={styles.rankPill}>{i + 1}</span>

                      {/* ⬇️ hover overlay */}
                      <div className={styles.cardOverlay}>
                        <h3 className={styles.ovTitle}>{f.prfnm}</h3>
                        <p className={styles.ovPeriod}>{f.prfpdfrom}</p>
                        <p className={styles.ovPeriod}>~</p>
                        <p className={styles.ovPeriod}>{f.prfpdto}</p>
                        <p className={styles.ovPlace}>{f.fcltynm}</p>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              )
            })}
          </Swiper>
        </div>
      ) : (
        <div className={styles.empty}>현재 예매 가능한 공연이 없습니다.</div>
      )}

      {/* ✅ 하단 바(가운데 기준 페이지 표시) */}
      {hasItems && (
        <>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowLeft} swiper-prev`}
            aria-label="이전 포스터"
            onClick={goPrev}
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
          </button>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowRight} swiper-next`}
            aria-label="다음 포스터"
            onClick={goNext}
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
          </button>

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
                    const src = buildPosterUrl(f)
                    const isActive = i === currentIndex

                    return (
                      <button
                        type="button"
                        key={`${f.fid ?? i}`}
                        className={`${styles.thumbBtn} ${isActive ? styles.activeThumb : ''}`}
                        onClick={() => swiperRef.current?.slideToLoop(i, 300)}
                        aria-label={`${i + 1}위 포스터로 이동`}
                      >
                        <img
                          src={src || '@/shared/assets/placeholder-poster.png'}
                          alt={f.prfnm}
                          className={styles.thumb}
                          onError={(e) => {
                            ;(e.currentTarget as HTMLImageElement).src =
                              '@/shared/assets/placeholder-poster.png'
                          }}
                          referrerPolicy="no-referrer"
                          draggable={false}
                        />
                      </button>
                    )
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
  )
}

export default HotSection
