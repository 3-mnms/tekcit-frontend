import React, { useEffect, useMemo, useRef, useState } from 'react'
import styles from './NearbyShowsPage.module.css'
import Button from '@/components/common/Button'
import Header from '@/components/common/header/Header'
import { useNavigate } from 'react-router-dom'
import { useNearbyFestivalsQuery } from '@/models/ai/tanstack-query/useNearbyFestivals'
import { useDefaultAddressQuery } from '@/models/auth/tanstack-query/useAddress'
import NearbySpotEmbed, { type NearbyFestivalMini } from '@/components/ai/nearby/NearbySpotEmbed'
import { loadKakaoMapSdk } from '@/shared/config/loadKakaoMap'
import Spinner from '@/components/common/spinner/Spinner'

type UiShow = {
  id: string
  title: string
  venue: string
  distanceKm: number | null
  lat?: number | null
  lng?: number | null
  poster?: string | null
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null

const asStr = (v: unknown): string | null =>
  typeof v === 'string' ? v : null

const asNum = (v: unknown): number | null => {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v)
  return null
}

const toUi = (raw: unknown): UiShow => {
  const r = isObj(raw) ? raw : {}
  const id =
    asStr(r.festivalDetailId) ??
    asStr(r.id) ??
    crypto.randomUUID()
  const title =
    asStr(r.name) ??
    asStr(r.festivalName) ??
    '-'
  const venue =
    asStr(r.venue) ??
    asStr(r.hallName) ??
    asStr(r.address) ??
    '-'
  const distanceKm =
    asNum(r.distance) ?? asNum(r.distanceKm)
  const lat =
    asNum(r.latitude) ?? asNum(r.lat)
  const lng =
    asNum(r.longitude) ?? asNum(r.lng)
  const poster =
    asStr(r.poster) ?? asStr(r.posterFile)

  return { id, title, venue, distanceKm: distanceKm ?? null, lat: lat ?? null, lng: lng ?? null, poster: poster ?? null }
}

const NearbyShowsPage: React.FC = () => {
  const navigate = useNavigate()
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapObjRef = useRef<kakao.maps.Map | null>(null)
  const markersRef = useRef<kakao.maps.Marker[]>([])
  const infoWindowsRef = useRef<kakao.maps.InfoWindow[]>([])

  const { data: defaultAddr, isLoading: isAddrLoading } = useDefaultAddressQuery()
  const { data, isLoading, isError, refetch } = useNearbyFestivalsQuery()
  const [selected, setSelected] = useState<NearbyFestivalMini | null>(null)

  const shows = useMemo<UiShow[]>(
    () => (Array.isArray(data?.festivalList) ? data!.festivalList.map(toUi) : []),
    [data],
  )

  const userCenter = useMemo(() => {
    const lat = asNum(data?.userGeocodeInfo?.latitude)
    const lng = asNum(data?.userGeocodeInfo?.longitude)
    return lat != null && lng != null ? { lat, lng } : null
  }, [data])

  const hasDefaultAddress = useMemo(() => {
    if (!defaultAddr) return false
    const candidate =
      defaultAddr.address ??
      ''
    return typeof candidate === 'string' && candidate.trim().length > 0
  }, [defaultAddr])

  useEffect(() => {
    let cancelled = false
    if (!mapRef.current) return

    const render = async () => {
      const kakao = await loadKakaoMapSdk()
      if (cancelled || !mapRef.current) return

      const firstWithPos = shows.find(s => s.lat != null && s.lng != null)
      const centerLat = userCenter?.lat ?? firstWithPos?.lat ?? 37.566826
      const centerLng = userCenter?.lng ?? firstWithPos?.lng ?? 126.9786567

      if (!mapObjRef.current) {
        mapObjRef.current = new kakao.maps.Map(mapRef.current, {
          center: new kakao.maps.LatLng(centerLat, centerLng),
          level: 6,
        })
      } else {
        mapObjRef.current.setCenter(new kakao.maps.LatLng(centerLat, centerLng))
      }

      const map = mapObjRef.current

      // 기존 마커/인포윈도우 정리
      markersRef.current.forEach(m => m.setMap(null))
      markersRef.current = []
      infoWindowsRef.current.forEach(iw => iw.close())
      infoWindowsRef.current = []

      // 경계 계산용 bounds
      const bounds = new kakao.maps.LatLngBounds()

      // 공연 마커 + 인포윈도우
      shows.forEach((s) => {
        if (s.lat == null || s.lng == null) return

        const pos = new kakao.maps.LatLng(s.lat, s.lng)
        const marker = new kakao.maps.Marker({ position: pos, map })
        markersRef.current.push(marker)
        bounds.extend(pos)

        const iw = new kakao.maps.InfoWindow({
          content: `<div style="padding:8px 10px;font-size:13px;">
            <b>${s.title}</b><br/>
            <span style="color:#666">${s.venue}</span>
          </div>`,
        })
        infoWindowsRef.current.push(iw)

        kakao.maps.event.addListener(marker, 'mouseover', () => iw.open(map, marker))
        kakao.maps.event.addListener(marker, 'mouseout', () => iw.close())
        kakao.maps.event.addListener(marker, 'click', () =>
          setSelected({ id: s.id, name: s.title, venue: s.venue, lat: s.lat ?? null, lng: s.lng ?? null }),
        )
      })

      // 사용자 위치 마커
      if (userCenter) {
        const pos = new kakao.maps.LatLng(userCenter.lat, userCenter.lng)
        const userMarker = new kakao.maps.Marker({ position: pos, map })
        markersRef.current.push(userMarker)
        bounds.extend(pos)
      }

      // 뷰포트 조정
      if (!bounds.isEmpty()) {
        map.setBounds(bounds, 40, 40, 40, 40)
      }
    }

    void render()

    return () => {
      cancelled = true
      markersRef.current.forEach(m => m.setMap(null))
      markersRef.current = []
      infoWindowsRef.current.forEach(iw => iw.close())
      infoWindowsRef.current = []
    }
  }, [shows, userCenter])

  useEffect(() => {
    if (isAddrLoading) return
    if (!hasDefaultAddress) {
      navigate('/mypage/myinfo/address', { replace: true, state: { from: 'nearby-shows' } })
    }
  }, [isAddrLoading, hasDefaultAddress, navigate])

  // 줌 컨트롤
  const zoomIn = () => {
    const m = mapObjRef.current
    if (!m) return
    const level = m.getLevel()
    m.setLevel(Math.max(1, level - 1))
  }
  const zoomOut = () => {
    const m = mapObjRef.current
    if (!m) return
    m.setLevel(m.getLevel() + 1)
  }

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
            {defaultAddr ? `${defaultAddr?.address || ''}`.trim() : <Spinner />}
            <button
              className={styles.addrBtn}
              type="button"
              onClick={() => navigate('/mypage/myinfo/address')}
            >
              기본 주소 변경
            </button>
          </div>
        </div>

        <div className={`${styles.content} ${selected ? styles.embedMode : ''}`}>
          {selected ? (
            <NearbySpotEmbed festival={selected} onBack={() => setSelected(null)} />
          ) : (
            <>
              {/* 왼쪽 리스트 */}
              <div className={styles.list}>
                {isLoading && <Spinner />}
                {isError && (
                  <div className={styles.error}>
                    불러오기에 실패했어요.
                    <button className={styles.retry} onClick={() => refetch()}>
                      다시 시도
                    </button>
                  </div>
                )}

                {!isLoading && !isError && shows.map((s) => (
                  <div key={s.id} className={styles.card}>
                    <div className={styles.poster} aria-hidden>
                      {s.poster ? <img src={s.poster} alt={`${s.title} 포스터`} /> : <span>포스터</span>}
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
                          onClick={() =>
                            setSelected({
                              id: s.id,
                              name: s.title,
                              venue: s.venue,
                              lat: s.lat ?? null,
                              lng: s.lng ?? null,
                            })
                          }
                        >
                          주변 볼거리 & 먹거리
                        </Button>
                        <Button
                          className={styles.btnPrimary}
                          onClick={() => navigate(`/festival/${s.id}`)}
                        >
                          공연 상세 페이지로 이동
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
                    <button type="button" aria-label="확대" onClick={zoomIn}>
                      <i className="fa-solid fa-plus" />
                    </button>
                    <button type="button" aria-label="축소" onClick={zoomOut}>
                      <i className="fa-solid fa-minus" />
                    </button>
                  </div>
                </div>
                <div ref={mapRef} className={styles.mapArea} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default NearbyShowsPage
