import React, { useEffect, useMemo, useRef, useState } from 'react'
import styles from './HotSection.module.css'
import type { Festival } from '@/models/festival/festivalType'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper/types'
import { Navigation, Keyboard, A11y, EffectCoverflow } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/effect-coverflow'

import { useHotFestivals } from '@/models/festival/tanstack-query/useHotFestivals'

/* ───────────────────────── 카테고리 매핑 ───────────────────────── */
const slugToCategory: Record<string, string> = {
  pop: '대중음악',
  dance: '무용',
  theater: '뮤지컬/연극',
  classic: '클래식/국악',
  magic: '서커스/마술',
  mix: '복합',
}

/* 포스터 URL 보정(절대경로/https 강제) */
const buildPosterUrl = (f: Partial<Festival>): string => {
  const raw = f?.poster ?? ''
  if (!raw) return ''
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw.replace(/^http:\/\//i, 'https://')
  }
  const path = raw.startsWith('/') ? raw : `/${raw}`
  return `https://www.kopis.or.kr${encodeURI(path)}`
}

/* 이미지 프리로드(유휴시간 사용) */
const preloadImages = (urls: string[]) => {
  const run = () => {
    urls.forEach((u) => {
      const img = new Image()
      img.src = u
    })
  }
  if ('requestIdleCallback' in window && typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(run as IdleRequestCallback)
  } else {
    setTimeout(run, 0)
  }
}

const HotSection: React.FC = () => {
  const { name: slug } = useParams<{ name?: string }>()
  const [hoveringBar, setHoveringBar] = useState(false)
  const swiperRef = useRef<SwiperType | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0) // 활성(가운데) 슬라이드의 "원본 배열" 인덱스
  const isCoarsePointer = useRef<boolean>(false)
  useEffect(() => {
    isCoarsePointer.current = window.matchMedia('(pointer:coarse)').matches
  }, [])

  const selectedCategory = useMemo(() => (slug ? (slugToCategory[slug] ?? null) : null), [slug])

  // ✅ 데이터 로드 & 캐싱 (최적화)
  const { data: items = [], isLoading } = useHotFestivals(selectedCategory, 10)
  const hasItems = items.length > 0

  // 배경 포스터 = 활성(가운데) 슬라이드 포스터
  const bgPoster = hasItems ? buildPosterUrl(items[currentIndex]) : ''
  useEffect(() => {
    setCurrentIndex(0)
    if (items.length) {
      swiperRef.current?.slideToLoop(0, 0)
      warmUpAround(0)
    }
  }, [selectedCategory, items.length])
  // 키보드 좌우 화살표
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!hasItems || !swiperRef.current) return
      if (e.key === 'ArrowRight') swiperRef.current.slideNext()
      else if (e.key === 'ArrowLeft') swiperRef.current.slidePrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hasItems])

  const goPrev = () => swiperRef.current?.slidePrev()
  const goNext = () => swiperRef.current?.slideNext()

  // ✅ 슬라이드 주변 이미지 프리로드
  const warmUpAround = (idx: number) => {
    if (!hasItems) return
    const around = [idx, idx + 1, idx - 1, idx + 2, idx - 2]
      .map((i) => ((i % items.length) + items.length) % items.length)
      .map((i) => buildPosterUrl(items[i]))
      .filter(Boolean)
    preloadImages(Array.from(new Set(around)))
  }

  const SLIDES_PER_VIEW = 5
  const shouldLoop = items.length > SLIDES_PER_VIEW

  return (
    <section className={styles.section}>
      {/* 배경: 가운데 카드 포스터 */}
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
      <div className={styles.bgOverlay} />

      <h2 className={styles.title}>
        {selectedCategory ? `${selectedCategory} HOT 공연` : '오늘의 HOT 공연'}
      </h2>

      {/* 캐러셀 */}
      {isLoading ? (
        <div className={styles.carouselWrap}>
          <div className={styles.skeletonRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        </div>
      ) : hasItems ? (
        <div className={styles.carouselWrap} aria-live="polite">
          <Swiper
            modules={[Navigation, Keyboard, A11y, EffectCoverflow]}
            effect="coverflow"
            grabCursor
            centeredSlides
            slidesPerView={5}
            initialSlide={0}
            loop={shouldLoop}
            watchOverflow
            coverflowEffect={{
              rotate: 10,
              stretch: 40,
              depth: 80,
              modifier: -1,
              slideShadows: false,
            }}
            spaceBetween={24}
            keyboard={{ enabled: true }}
            navigation={{ nextEl: '.swiper-next', prevEl: '.swiper-prev' }}
            breakpoints={{
              0: { slidesPerView: 3, spaceBetween: 12, centeredSlides: true },
              768: { slidesPerView: 5, spaceBetween: 20, centeredSlides: true },
              1024: { slidesPerView: 5, spaceBetween: 24, centeredSlides: true },
            }}
            onSwiper={(sw) => {
              swiperRef.current = sw
              sw.slideToLoop(0, 0)
              setCurrentIndex(sw.realIndex)
              warmUpAround(0)
            }}
            onSlideChange={(sw) => {
              setCurrentIndex(sw.realIndex)
              warmUpAround(sw.realIndex)
            }}
            className={styles.heroSwiper}
          >
            {items.map((f, i) => {
              const poster = buildPosterUrl(f)
              const isActive = i === currentIndex

              const handleClick = (e: React.MouseEvent) => {
                if (!isActive) {
                  e.preventDefault()
                  swiperRef.current?.slideToLoop(i, 400) // 옆 카드 → 가운데로
                }
              }

              return (
                <SwiperSlide key={f.fid ?? i} className={styles.slide}>
                  <Link
                    to={isActive ? `/festival/${f.fid}` : '#'} // 중앙 카드만 상세 진입
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
                      {/* ✅ lazy 이미지 + async 디코드 */}
                      <img
                        src={poster || '@/shared/assets/placeholder-poster.png'}
                        alt={f.prfnm}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        draggable={false}
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement
                          el.removeAttribute('data-src')
                          el.src = '@/shared/assets/placeholder-poster.png'
                        }}
                      />

                      <span className={styles.rankPill}>{i + 1}</span>

                      {/* hover overlay */}
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

      {/* 하단 바/네비 */}
      {hasItems && !isLoading && (
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
            style={{ '--segments': items.length, '--index': currentIndex } as React.CSSProperties}
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
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          draggable={false}
                          onError={(e) => {
                            ;(e.currentTarget as HTMLImageElement).src =
                              '@/shared/assets/placeholder-poster.png'
                          }}
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
