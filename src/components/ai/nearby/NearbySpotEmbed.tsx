// src/components/ai/nearby/NearbySpotEmbed.tsx
import React, { useMemo, useState, useEffect } from 'react'
import styles from './NearbySpotEmbed.module.css'
import Button from '@/components/common/Button'
import {
  useNearbyActivities,
  pickRecommendForFestival,
} from '@/models/ai/tanstack-query/useNearbyFestivals'
import MapView from './MapView'
import SpotCard, { type PlayEatSpot, type BaseSpot } from './SpotCard'
import Spinner from '@/components/common/spinner/Spinner'
import { PartyPopper, Utensils, MapPin } from 'lucide-react'

type TabKey = 'play' | 'eat' | 'course'

export type NearbyFestivalMini = {
  id: string
  name: string
  venue?: string | null
  lat?: number | null
  lng?: number | null
}

// CourseSpot은 BaseSpot 그대로 사용
type CourseSpot = BaseSpot

export default function NearbySpotEmbed({
  festival,
  onBack,
}: {
  festival: NearbyFestivalMini
  onBack: () => void
}) {
  const { data, isLoading, isError, refetch } = useNearbyActivities()
  const rec = useMemo(() => pickRecommendForFestival(data, festival.id), [data, festival.id])

  // 놀거리
  const playItems: PlayEatSpot[] = useMemo(
    () =>
      (rec?.hotPlaces ?? []).map((a, i) => ({
        id: `p-${i}`,
        kind: 'play',
        name: a.activityName,
        address: a.addressName,
        lat: a.latitude ?? festival.lat ?? 37.566826,
        lng: a.longitude ?? festival.lng ?? 126.9786567,
      })),
    [rec?.hotPlaces, festival.lat, festival.lng],
  )

  // 먹거리
  const eatItems: PlayEatSpot[] = useMemo(
    () =>
      (rec?.restaurants ?? []).map((a, i) => ({
        id: `e-${i}`,
        kind: 'eat',
        name: a.activityName,
        address: a.addressName,
        lat: a.latitude ?? festival.lat ?? 37.566826,
        lng: a.longitude ?? festival.lng ?? 126.9786567,
      })),
    [rec?.restaurants, festival.lat, festival.lng],
  )

  // 추천코스 문자열 파싱
  const courseRows = useMemo(() => {
    const c = rec?.courseDTO
    const raws = [c?.course1, c?.course2, c?.course3, c?.course4, c?.course5].filter(
      Boolean,
    ) as string[]
    return raws.map((raw) =>
      raw
        .split('→')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 3),
    )
  }, [rec?.courseDTO])

  // 문자열 매칭 유틸
  const norm = (s: string) => s.replace(/\s+/g, '').replace(/[()]/g, '').toLowerCase()

  const courseSpots: CourseSpot[][] = useMemo(() => {
    if (!courseRows.length) return []
    const pool = [...playItems, ...eatItems]

    return courseRows.map((row, rowIdx) =>
      row.map((label, idx) => {
        if (idx === 0) {
          return {
            id: `course-${rowIdx}-festival`,
            name: festival.name,
            lat: festival.lat ?? 37.566826,
            lng: festival.lng ?? 126.9786567,
            address: festival.venue ?? '',
          }
        }
        const key = norm(label)
        const match = pool.find((p) => norm(p.name) === key || norm(p.name).includes(key))
        return match
          ? {
              id: `course-${rowIdx}-${idx}`,
              name: match.name,
              lat: match.lat,
              lng: match.lng,
              address: match.address,
            }
          : {
              id: `course-${rowIdx}-${idx}`,
              name: label,
              lat: festival.lat ?? 37.566826,
              lng: festival.lng ?? 126.9786567,
              address: '',
            }
      }),
    )
  }, [courseRows, playItems, eatItems, festival])

  const [active, setActive] = useState<TabKey>('play')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // ✅ 코스에서 선택된 row 인덱스 (null이면 아직 선택 안 함)
  const [selectedCourseIdx, setSelectedCourseIdx] = useState<number | null>(null)

  // 탭 변경 시 선택 리셋
  useEffect(() => {
    setSelectedId(null)
    if (active !== 'course') {
      setSelectedCourseIdx(null)
    } else {
      // 코스 탭 들어올 때 기본으로 0번 선택하고 싶으면 주석 해제
      // if (selectedCourseIdx === null && courseSpots.length > 0) setSelectedCourseIdx(0)
    }
  }, [active]) // eslint-disable-line react-hooks/exhaustive-deps

  // 현재 리스트 아이템
  const items: BaseSpot[] =
    active === 'play'
      ? playItems
      : active === 'eat'
      ? eatItems
      : selectedCourseIdx !== null
      ? courseSpots[selectedCourseIdx] // ✅ 선택된 코스 row만
      : [] // 아직 row 선택 안 했으면 빈 배열

  return (
    <section className={styles.page} aria-label="주변 추천">
      <header className={styles.headerRow}>
        <div className={styles.titleWrap}>
          <h2 className={styles.pageTitle}>{festival.name}</h2>
          {festival.venue && <div className={styles.subtitle}>{festival.venue}</div>}
        </div>
        <div className={styles.headerActions}>
          <Button className={styles.backBtn} onClick={onBack}>
            공연 목록으로
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className={styles.tabs} role="tablist" aria-label="추천 탭">
        <TabButton
          icon={<PartyPopper size={16} />}
          label="놀거리"
          active={active === 'play'}
          onClick={() => setActive('play')}
        />
        <TabButton
          icon={<Utensils size={16} />}
          label="먹거리"
          active={active === 'eat'}
          onClick={() => setActive('eat')}
        />
        <TabButton
          icon={<MapPin size={16} />}
          label="추천 코스"
          active={active === 'course'}
          onClick={() => setActive('course')}
        />
      </div>

      {/* Loading/Error/Empty */}
      {isLoading && <Spinner />}
      {isError && (
        <div className={styles.error}>
          불러오기에 실패했어요.
          <button className={styles.retry} onClick={() => refetch()}>
            다시 시도
          </button>
        </div>
      )}
      {!isLoading && !isError && !rec && (
        <div className={styles.empty}>추천 데이터가 없어요.</div>
      )}

      {/* Body */}
      {!isLoading && !isError && rec && (
        <div className={styles.body}>
          <ul className={styles.list} role="list">
            {active !== 'course' ? (
              items.slice(0, 5).map((spot) => (
                <li key={spot.id}>
                  {/* 놀거리/먹거리 카드 */}
                  <SpotCard
                    spot={spot as PlayEatSpot}
                    active={spot.id === selectedId}
                    onClick={() => setSelectedId(spot.id)}
                  />
                </li>
              ))
            ) : (
              <li>
                {courseRows.length ? (
                  <div className={styles.courseList}>
                    {courseSpots.map((steps, rowIdx) => {
                      const isActiveRow = selectedCourseIdx === rowIdx
                      return (
                        <button
                          key={rowIdx}
                          type="button"
                          className={`${styles.courseRow} ${styles.courseAccent} ${
                            isActiveRow ? styles.cardActive : ''
                          }`}
                          onClick={() => {
                            setSelectedCourseIdx(rowIdx)   // ✅ 이 row 선택
                            setSelectedId(null)            // 선택 리셋(옵션)
                          }}
                        >
                          <div className={styles.courseNodes}>
                            {steps.map((spot, idx) => {
                              const cls =
                                idx === 0
                                  ? styles.nodeGreen
                                  : idx === steps.length - 1
                                  ? styles.nodePurple
                                  : styles.nodeBlue
                              return (
                                <React.Fragment key={spot.id}>
                                  <span className={`${styles.node} ${cls}`}>
                                    {spot.name}
                                  </span>
                                  {idx < steps.length - 1 && (
                                    <span className={styles.dash} />
                                  )}
                                </React.Fragment>
                              )
                            })}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className={styles.emptySmall}>등록된 코스가 없어요.</div>
                )}
              </li>
            )}
          </ul>

          <MapView
            festival={festival}
            items={items} // ✅ 코스면 선택된 row만 전달
            active={active}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
          />
        </div>
      )}
    </section>
  )
}

function TabButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      className={`${styles.tab} ${active ? styles.tabActive : ''}`}
      onClick={onClick}
      type="button"
    >
      <span className={styles.tabIcon}>{icon}</span>
      {label}
    </button>
  )
}
