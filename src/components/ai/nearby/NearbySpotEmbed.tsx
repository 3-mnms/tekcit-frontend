import React, { useMemo, useState, useEffect } from 'react'
import styles from './NearbySpotEmbed.module.css'
import { FiMapPin, FiCoffee, FiSmile } from 'react-icons/fi'
import Button from '@/components/common/Button'
import {
  useNearbyActivities,
  pickRecommendForFestival,
} from '@/models/ai/tanstack-query/useNearbyFestivals'
import MapView from './MapView'
import SpotCard, { type PlayEatSpot } from './SpotCard'

type TabKey = 'play' | 'eat' | 'course'

export type NearbyFestivalMini = {
  id: string
  name: string
  venue?: string | null
  lat?: number | null
  lng?: number | null
}

export default function NearbySpotEmbed({
  festival,
  onBack,
}: {
  festival: NearbyFestivalMini
  onBack: () => void
}) {
  const { data, isLoading, isError, refetch } = useNearbyActivities()
  const rec = useMemo(() => pickRecommendForFestival(data, festival.id), [data, festival.id])

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

  const courseSteps = useMemo(() => {
    const c = rec?.courseDTO
    return [c?.course1, c?.course2, c?.course3].filter(Boolean) as string[]
  }, [rec?.courseDTO])

  const [active, setActive] = useState<TabKey>('play')
  const items = active === 'play' ? playItems : active === 'eat' ? eatItems : []
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    setSelectedId(null)
  }, [active])

  return (
    <section className={styles.page} aria-label="주변 추천">
      {/* Header */}
      <header className={styles.headerRow}>
        <div className={styles.titleWrap}>
          <h2 className={styles.pageTitle}>{festival.name} 주변 즐길거리 &amp; 맛집 추천</h2>
          {festival.venue && <div className={styles.subtitle}>{festival.venue}</div>}
        </div>
        <div className={styles.headerActions}>
          <Button className={styles.backBtn} onClick={onBack}>
            ← 공연 목록으로
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className={styles.tabs} role="tablist" aria-label="추천 탭">
        <TabButton icon={<FiSmile />} label="놀거리" active={active === 'play'} onClick={() => setActive('play')} />
        <TabButton icon={<FiCoffee />} label="먹거리" active={active === 'eat'} onClick={() => setActive('eat')} />
        <TabButton icon={<FiMapPin />} label="추천 코스" active={active === 'course'} onClick={() => setActive('course')} />
      </div>

      {/* Loading/Error */}
      {isLoading && <div className={styles.skeleton}>추천 정보를 불러오는 중…</div>}
      {isError && (
        <div className={styles.error}>
          불러오기에 실패했어요.
          <button className={styles.retry} onClick={() => refetch()}>다시 시도</button>
        </div>
      )}
      {!isLoading && !isError && !rec && <div className={styles.empty}>추천 데이터가 없어요.</div>}

      {/* Body */}
      {!isLoading && !isError && rec && (
        <div className={styles.body}>
          <ul className={styles.list} role="list">
            {active !== 'course' ? (
              items.slice(0, 3).map((spot) => (
                <li key={spot.id}>
                  <SpotCard
                    spot={spot}
                    active={spot.id === selectedId}
                    onClick={() => setSelectedId(spot.id)}
                  />
                </li>
              ))
            ) : (
              <li className={styles.courseBox}>
                <strong className={styles.courseTitle}>추천 코스</strong>
                {courseSteps.length ? (
                  <ol className={styles.courseSteps}>
                    {courseSteps.map((st, i) => <li key={i}>{st}</li>)}
                  </ol>
                ) : (
                  <div className={styles.emptySmall}>등록된 코스가 없어요.</div>
                )}
              </li>
            )}
          </ul>

          <MapView
            festival={festival}
            items={items}
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
