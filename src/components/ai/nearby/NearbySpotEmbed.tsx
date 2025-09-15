import React, { useEffect, useMemo, useRef, useState } from 'react'
import styles from './NearbySpotEmbed.module.css'
import { FiMapPin, FiCoffee, FiSmile } from 'react-icons/fi'
import Button from '@/components/common/Button'
import {
  useNearbyActivities,
  pickRecommendForFestival,
} from '@/models/ai/tanstack-query/useNearbyFestivals'
import { loadKakaoMapSdk } from '@/shared/config/loadKakaoMap'

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

  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapObjRef = useRef<kakao.maps.Map | null>(null)
  const markersRef = useRef<kakao.maps.Marker[]>([])

  useEffect(() => {
    let cancelled = false
    if (!mapRef.current) return

    const init = async () => {
      const kakao = await loadKakaoMapSdk()
      if (cancelled || !mapRef.current) return

      const centerLat = festival.lat ?? items[0]?.lat ?? 37.566826
      const centerLng = festival.lng ?? items[0]?.lng ?? 126.9786567

      if (!mapObjRef.current) {
        mapObjRef.current = new kakao.maps.Map(mapRef.current, {
          center: new kakao.maps.LatLng(centerLat, centerLng),
          level: 6,
        })
      }
      const map = mapObjRef.current

      markersRef.current.forEach((m) => m.setMap(null))
      markersRef.current = []

      const targets: Array<{
        id?: string
        name?: string
        address?: string
        lat: number
        lng: number
        label?: string
      }> =
        active === 'course'
          ? festival.lat && festival.lng
            ? [{ lat: festival.lat, lng: festival.lng, label: festival.name }]
            : []
          : items.slice(0, 3).map((s) => ({ id: s.id, name: s.name, address: s.address, lat: s.lat, lng: s.lng }))

      // bounds & marker helper
      const bounds = new kakao.maps.LatLngBounds()
      const addMarker = (lat: number, lng: number, label?: string, address?: string): kakao.maps.Marker => {
        const map = mapObjRef.current
        if (!map) throw new Error("mapObjRef.current is null")

        const pos = new kakao.maps.LatLng(lat, lng)
        const marker = new kakao.maps.Marker({
          position: pos,
          map,
        })
        markersRef.current.push(marker)
        bounds.extend(pos)

        if (label) {
          const iw = new kakao.maps.InfoWindow({
            content: `
        <div style="
          box-sizing:border-box;
          max-width:240px;
          padding:6px 8px;
          font-size:12px;
          line-height:1.4;
          white-space:normal;
          word-break:break-word;
          overflow-wrap:anywhere;
        ">
          <b style="display:block;margin-bottom:2px;">${label}</b>
          ${address ? `<span style="color:#666">${address}</span>` : ""}
        </div>
      `,
          })

          kakao.maps.event.addListener(marker, 'mouseover', () => iw.open(map, marker))
          kakao.maps.event.addListener(marker, 'mouseout', () => iw.close())
        }

        return marker
      }

      targets.forEach((t) =>
        addMarker(t.lat, t.lng, t.name ?? t.label, t.address ?? festival.venue ?? "")
      )
      if (active !== 'course' && festival.lat && festival.lng) {
        addMarker(festival.lat, festival.lng, festival.name, festival.venue ?? "")
      }

      if (active !== 'course') {
        markersRef.current.forEach((marker, i) => {
          kakao.maps.event.addListener(marker, 'click', () => {
            const t = targets[i]
            if (t?.id) setSelectedId(t.id)
            const pos = marker.getPosition()
            map.setCenter(pos)
          })
        })
      }

      if (!bounds.isEmpty()) {
        map.setBounds(bounds, 50, 50, 50, 50)
      } else {
        map.setCenter(new kakao.maps.LatLng(centerLat, centerLng))
      }
    }

    void init()

    return () => {
      cancelled = true
      markersRef.current.forEach((m) => m.setMap(null))
      markersRef.current = []
    }
  }, [active, items, selected?.id, festival.lat, festival.lng, festival.name, festival.venue])

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
