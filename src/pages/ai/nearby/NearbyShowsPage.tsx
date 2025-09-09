import React, { useEffect, useMemo, useRef } from 'react'
import styles from './NearbyShowsPage.module.css'
import Button from '@/components/common/Button'
import Header from '@/components/common/header/Header'
import { useNavigate } from 'react-router-dom'
import { useNearbyFestivalsQuery } from '@/models/ai/tanstack-query/useNearbyFestivals'
import { useDefaultAddressQuery } from '@/models/auth/tanstack-query/useAddress'

declare global {
  interface Window {
    kakao: any
  }
}

type UiShow = {
  id: string
  title: string
  venue: string
  distanceKm: number | null
  lat?: number | null
  lng?: number | null
  poster?: string | null
}

const toUi = (raw: any): UiShow => ({
  id: String(raw.festivalId ?? raw.id ?? crypto.randomUUID()),
  title: raw.title ?? raw.festivalName ?? '-',
  venue: raw.venue ?? raw.hallName ?? raw.address ?? '-',
  distanceKm:
    typeof raw.distance === 'number'
      ? Number(raw.distance)
      : typeof raw.distanceKm === 'number'
        ? Number(raw.distanceKm)
        : null,
  lat: raw.latitude ?? raw.lat ?? null,
  lng: raw.longitude ?? raw.lng ?? null,
  poster: raw.posterUrl ?? raw.posterFile ?? null,
})

const NearbyShowsPage: React.FC = () => {
  const navigate = useNavigate()
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapObjRef = useRef<any>(null)

  const { data: defaultAddr } = useDefaultAddressQuery()
  const { data, isLoading, isError, refetch } = useNearbyFestivalsQuery()

  const shows = useMemo<UiShow[]>(() => (data?.festivalList ?? []).map(toUi), [data])

  const userCenter = useMemo(() => {
    const lat = data?.userGeocodeInfo?.latitude ?? null
    const lng = data?.userGeocodeInfo?.longitude ?? null
    return lat && lng ? { lat, lng } : null
  }, [data])

  useEffect(() => {
    if (!mapRef.current) return
    if (!window.kakao?.maps) return 

    const render = () => {
      const centerLat = userCenter?.lat ?? shows.find((s) => s.lat && s.lng)?.lat ?? 37.566826
      const centerLng = userCenter?.lng ?? shows.find((s) => s.lat && s.lng)?.lng ?? 126.9786567

      const mapOption = {
        center: new window.kakao.maps.LatLng(centerLat, centerLng),
        level: 6,
      }

      const map = mapObjRef.current ?? new window.kakao.maps.Map(mapRef.current as any, mapOption)
      if (!mapObjRef.current) mapObjRef.current = map
      else map.setCenter(mapOption.center)

      // 기존 오버레이/마커 정리용
      ;(map.__markers ?? []).forEach((m: any) => m.setMap(null))
      map.__markers = []

      shows.forEach((s) => {
        if (!s.lat || !s.lng) return
        const pos = new window.kakao.maps.LatLng(s.lat, s.lng)
        const marker = new window.kakao.maps.Marker({ position: pos, map })
        map.__markers.push(marker)

        const iw = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:8px 10px;font-size:13px;">
              <b>${s.title}</b><br/>
              <span style="color:#666">${s.venue}</span>
            </div>`,
        })

        window.kakao.maps.event.addListener(marker, 'mouseover', () => iw.open(map, marker))
        window.kakao.maps.event.addListener(marker, 'mouseout', () => iw.close())
        window.kakao.maps.event.addListener(marker, 'click', () => navigate(`/festival/${s.id}`))
      })

      // 사용자 위치 마커(있을 경우)
      if (userCenter) {
        const userMarker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(userCenter.lat, userCenter.lng),
          map,
        })
        map.__markers.push(userMarker)
      }
    }

    if (window.kakao?.maps?.load) {
      window.kakao.maps.load(render)
    } else {
      render()
    }
  }, [shows, userCenter, navigate])

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.page}>
        <div className={styles.headerRow}>
          <div className={styles.titleWrap}>
            <i className="fa-solid fa-map-location-dot" />
            <h1>내 주변 공연 추천</h1>
          </div>

          <div className={styles.addr}>
            현재 주소:&nbsp;
            {defaultAddr
              ? `${defaultAddr?.address || ''} ${defaultAddr?.address || ''}`.trim()
              : '불러오는 중…'}
            <button
              className={styles.addrBtn}
              type="button"
              onClick={() => navigate('/mypage/address')}
            >
              기본 주소 변경
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {/* 왼쪽 리스트 */}
          <div className={styles.list}>
            {isLoading && <div className={styles.skeleton}>근처 공연을 불러오는 중…</div>}
            {isError && (
              <div className={styles.error}>
                불러오기에 실패했어요.
                <button className={styles.retry} onClick={() => refetch()}>
                  다시 시도
                </button>
              </div>
            )}

            {!isLoading &&
              !isError &&
              shows.map((s) => (
                <div key={s.id} className={styles.card}>
                  <div className={styles.poster} aria-hidden>
                    {s.poster ? (
                      <img src={s.poster} alt={`${s.title} 포스터`} />
                    ) : (
                      <span>포스터</span>
                    )}
                  </div>

                  <div className={styles.meta}>
                    <h3 className={styles.cardTitle}>{s.title}</h3>
                    <div className={styles.venue}>{s.venue}</div>
                    <div className={styles.distance}>
                      내 위치로부터 <b>{s.distanceKm != null ? `${s.distanceKm}km` : '-'}</b>
                    </div>

                    <div className={styles.actions}>
                      <Button
                        className={styles.btnGhost}
                        onClick={() => alert('주변 볼거리 & 먹거리 (준비 중)')}
                      >
                        주변 볼거리 & 먹거리
                      </Button>
                      <Button
                        className={styles.btnPrimary}
                        onClick={() => navigate(`/festival/${s.id}`)}
                      >
                        상세 페이지로 이동
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* 오른쪽 카카오맵 */}
          <div className={styles.mapWrap}>
            <div className={styles.mapHeader}>
              <span>지도 (카카오맵)</span>
              <div className={styles.mapTools}>
                <button
                  type="button"
                  aria-label="확대"
                  onClick={() =>
                    mapObjRef.current &&
                    mapObjRef.current.setLevel(mapObjRef.current.getLevel() - 1)
                  }
                >
                  <i className="fa-solid fa-plus" />
                </button>
                <button
                  type="button"
                  aria-label="축소"
                  onClick={() =>
                    mapObjRef.current &&
                    mapObjRef.current.setLevel(mapObjRef.current.getLevel() + 1)
                  }
                >
                  <i className="fa-solid fa-minus" />
                </button>
              </div>
            </div>
            <div ref={mapRef} className={styles.mapArea} />
            {/* <div className={styles.kakaoBadge}>Kakao Map</div> */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NearbyShowsPage
