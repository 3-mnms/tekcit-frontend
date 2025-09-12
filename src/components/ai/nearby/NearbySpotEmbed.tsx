import React, { useEffect, useMemo, useRef, useState } from 'react'
import styles from './NearbySpotEmbed.module.css'
import { FiMapPin, FiCoffee, FiSmile } from 'react-icons/fi'
import Button from '@/components/common/Button'
import {
  useNearbyActivities,
  pickRecommendForFestival,
} from '@/models/ai/tanstack-query/useNearbyFestivals'

declare global {
  interface Window {
    kakao: any
  }
}

type TabKey = 'play' | 'eat' | 'course'

export type NearbyFestivalMini = {
  id: string
  name: string
  venue?: string | null
  lat?: number | null
  lng?: number | null
}

type SpotBase = {
  id: string
  name: string
  address: string
  url?: string
  lat: number
  lng: number
  distanceKm?: number
}
type PlayEatSpot = SpotBase & { kind: 'play' | 'eat' }

export default function NearbySpotEmbed({
  festival,
  onBack,
}: {
  festival: NearbyFestivalMini
  onBack: () => void
}) {
  const { data, isLoading, isError, refetch } = useNearbyActivities()
  const rec = useMemo(() => pickRecommendForFestival(data, festival.id), [data, festival.id])

  // 좌표 기반 리스트
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
  const selected = useMemo(
    () => items.find((x) => x.id === selectedId) ?? items[0],
    [items, selectedId],
  )

  // ✅ Kakao Map refs
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapObjRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  // ✅ Kakao Map init & marker render
  useEffect(() => {
    if (!mapRef.current) return
    if (!window.kakao?.maps) return

    const load = () => {
      const kakao = window.kakao
      const centerLat = festival.lat ?? items[0]?.lat ?? 37.566826
      const centerLng = festival.lng ?? items[0]?.lng ?? 126.9786567

      // init map once
      if (!mapObjRef.current) {
        mapObjRef.current = new kakao.maps.Map(mapRef.current, {
          center: new kakao.maps.LatLng(centerLat, centerLng),
          level: 6,
        })
      }

      const map = mapObjRef.current as any

      // clear old markers
      markersRef.current.forEach((m) => m.setMap(null))
      markersRef.current = []

      // course 탭: 공연장만
      const targets: Array<{
        id?: string
        name?: string
        lat: number
        lng: number
        label?: string
      }> =
        active === 'course'
          ? festival.lat && festival.lng
            ? [{ lat: festival.lat, lng: festival.lng, label: festival.name }]
            : []
          : items.slice(0, 3).map((s) => ({ id: s.id, name: s.name, lat: s.lat, lng: s.lng }))

      // bounds 계산
      const bounds = new kakao.maps.LatLngBounds()
      const addMarker = (lat: number, lng: number, isSelected = false, text?: string) => {
        const pos = new kakao.maps.LatLng(lat, lng)
        const marker = new kakao.maps.Marker({
          position: pos,
          map,
          // 선택된 마커 조금 크게(선택적)
          image: isSelected
            ? new kakao.maps.MarkerImage(
                'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerRed.png',
                new kakao.maps.Size(36, 37),
              )
            : undefined,
        })
        markersRef.current.push(marker)
        bounds.extend(pos)
        return marker
      }

      // place/festival markers
      targets.forEach((t) => addMarker(t.lat, t.lng, t.id === selected?.id, t.label))

      // 공연장 마커(항상 함께 보여주고 싶다면 아래 활성화)
      if (active !== 'course' && festival.lat && festival.lng) {
        addMarker(festival.lat, festival.lng, false, festival.name)
      }

      // 선택된 항목 클릭 핸들러
      if (active !== 'course') {
        markersRef.current.forEach((marker, i) => {
          kakao.maps.event.addListener(marker, 'click', () => {
            const t = targets[i]
            if (t?.id) setSelectedId(t.id)
            map.panTo(marker.getPosition())
          })
        })
      }

      // 지도 중심/줌
      if (!bounds.isEmpty()) {
        map.setBounds(bounds, 50, 50, 50, 50)
      } else {
        map.setCenter(new kakao.maps.LatLng(centerLat, centerLng))
      }
    }

    // SDK가 load 함수를 제공할 때
    if (window.kakao.maps.load) {
      window.kakao.maps.load(load)
    } else {
      load()
    }

    // cleanup on unmount
    return () => {
      markersRef.current.forEach((m) => m.setMap(null))
      markersRef.current = []
    }
  }, [active, items, selected?.id, festival.lat, festival.lng, festival.name])

  return (
    <section className={styles.page} aria-label="주변 추천">
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

      <div className={styles.tabs} role="tablist" aria-label="추천 탭">
        <TabButton
          icon={<FiSmile aria-hidden />}
          label="놀거리"
          active={active === 'play'}
          onClick={() => setActive('play')}
        />
        <TabButton
          icon={<FiCoffee aria-hidden />}
          label="먹거리"
          active={active === 'eat'}
          onClick={() => setActive('eat')}
        />
        <TabButton
          icon={<FiMapPin aria-hidden />}
          label="추천 코스"
          active={active === 'course'}
          onClick={() => setActive('course')}
        />
      </div>

      {isLoading && <div className={styles.skeleton}>추천 정보를 불러오는 중…</div>}
      {isError && (
        <div className={styles.error}>
          불러오기에 실패했어요.{' '}
          <button className={styles.retry} onClick={() => refetch()}>
            다시 시도
          </button>
        </div>
      )}
      {!isLoading && !isError && !rec && (
        <div className={styles.empty}>해당 공연장의 추천 데이터가 아직 없어요.</div>
      )}

      {!isLoading && !isError && rec && (
        <div className={styles.body}>
          {/* 좌측 리스트 */}
          <ul className={styles.list} role="list">
            {active !== 'course' ? (
              items.slice(0, 3).map((spot) => (
                <li key={spot.id}>
                  <SpotCard
                    spot={spot}
                    active={spot.id === selected?.id}
                    onClick={() => setSelectedId(spot.id)}
                  />
                </li>
              ))
            ) : (
              <li className={styles.courseBox}>
                <strong className={styles.courseTitle}>추천 코스</strong>
                {courseSteps.length ? (
                  <ol className={styles.courseSteps}>
                    {courseSteps.map((st, i) => (
                      <li key={i}>{st}</li>
                    ))}
                  </ol>
                ) : (
                  <div className={styles.emptySmall}>등록된 코스가 없어요.</div>
                )}
              </li>
            )}
          </ul>

          {/* 우측: 카카오맵 */}
          <div className={styles.mapWrap}>
            <div className={styles.mapHeader}>지도</div>
            <div ref={mapRef} className={styles.mapBox} aria-label="카카오맵" />
          </div>
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

function SpotCard({
  spot,
  active,
  onClick,
}: {
  spot: PlayEatSpot
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      className={`${styles.card} ${active ? styles.cardActive : ''}`}
      onClick={onClick}
      type="button"
      aria-pressed={active}
    >
      <div className={styles.cardBadge} aria-hidden />
      <div className={styles.cardMain}>
        <div className={styles.cardTitleRow}>
          <strong className={styles.cardTitle}>{spot.name}</strong>
        </div>
        <div className={styles.addr}>{spot.address}</div>
      </div>
    </button>
  )
}
