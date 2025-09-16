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
import { MapPin, Navigation, ExternalLink, Utensils } from "lucide-react"

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
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const { data: defaultAddr, isLoading: isAddrLoading } = useDefaultAddressQuery()
  const { data, isLoading, isError } = useNearbyFestivalsQuery()
  const [selected, setSelected] = useState<NearbyFestivalMini | null>(null)

  // ✅ Kakao SDK 사전 로드
  const [sdkLoaded, setSdkLoaded] = useState(false)
  useEffect(() => {
    let mounted = true
    loadKakaoMapSdk()
      .then(() => mounted && setSdkLoaded(true))
      .catch(() => mounted && setSdkLoaded(false))
    return () => { mounted = false }
  }, [])

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
    const candidate = defaultAddr.address ?? ''
    return typeof candidate === 'string' && candidate.trim().length > 0
  }, [defaultAddr])

  // 기본 주소 없으면 이동
  useEffect(() => {
    if (isAddrLoading) return
    if (!hasDefaultAddress) {
      navigate('/mypage/myinfo/address', { replace: true, state: { from: 'nearby-shows' } })
    }
  }, [isAddrLoading, hasDefaultAddress, navigate])

  // ✅ 전역 게이트 플래그: 전부 준비되어야 true
  const pageReady = !isAddrLoading && hasDefaultAddress && !isLoading && !isError && sdkLoaded

  useEffect(() => {
    if (selected === null) {
      // 목록으로 돌아왔을 때 다음 run에서 새 컨테이너에 맞춰 재생성
      mapObjRef.current = null;
      mapContainerRef.current = null;
    }
  }, [selected]);

  // ✅ 맵 렌더는 게이트 뒤에만 실행
  useEffect(() => {
    if (!pageReady) return
    if (!sdkLoaded) return
    if (!mapRef.current) return

    let cancelled = false


    const run = async () => {
      const kakaoNS = await loadKakaoMapSdk();
      if (cancelled || !mapRef.current) return;

      const firstWithPos = shows.find(s => s.lat != null && s.lng != null);
      const centerLat = userCenter?.lat ?? firstWithPos?.lat ?? 37.566826;
      const centerLng = userCenter?.lng ?? firstWithPos?.lng ?? 126.9786567;

      const containerChanged = mapContainerRef.current !== mapRef.current;

      if (!mapObjRef.current || containerChanged) {
        mapObjRef.current = new kakaoNS.maps.Map(mapRef.current, {
          center: new kakaoNS.maps.LatLng(centerLat, centerLng),
          level: 6,
        });
        mapContainerRef.current = mapRef.current; 
      } else {
        mapObjRef.current.setCenter(new kakaoNS.maps.LatLng(centerLat, centerLng));
      }

      const map = mapObjRef.current!

      markersRef.current.forEach(m => m.setMap(null))
      markersRef.current = []
      infoWindowsRef.current.forEach(iw => iw.close())
      infoWindowsRef.current = []

      const bounds = new kakaoNS.maps.LatLngBounds()

      shows.forEach((s) => {
        if (s.lat == null || s.lng == null) return
        const pos = new kakaoNS.maps.LatLng(s.lat, s.lng)
        const marker = new kakaoNS.maps.Marker({ position: pos, map })
        markersRef.current.push(marker)
        bounds.extend(pos)

        const iw = new kakaoNS.maps.InfoWindow({
          content: `
    <div style="
      box-sizing:border-box;
      max-width: 260px;           
      padding: 8px 10px;
      font-size: 13px;
      line-height: 1.4;
      white-space: normal;        
      word-break: break-word;     
      overflow-wrap: anywhere;    
    ">
      <b style="display:block;margin-bottom:4px;font-weight:600;">
        ${s.title}
      </b>
      <span style="color:#666">${s.venue}</span>
    </div>
  `,
        })
        infoWindowsRef.current.push(iw)

        kakaoNS.maps.event.addListener(marker, 'mouseover', () => iw.open(map, marker))
        kakaoNS.maps.event.addListener(marker, 'mouseout', () => iw.close())
        kakaoNS.maps.event.addListener(marker, 'click', () =>
          setSelected({ id: s.id, name: s.title, venue: s.venue, lat: s.lat ?? null, lng: s.lng ?? null }),
        )
      })

      // 사용자 위치
      if (userCenter) {
        const pos = new kakaoNS.maps.LatLng(userCenter.lat, userCenter.lng)
        const userMarker = new kakaoNS.maps.Marker({ position: pos, map })
        markersRef.current.push(userMarker)
        bounds.extend(pos)
      }

      if (!bounds.isEmpty()) {
        map.setBounds(bounds, 40, 40, 40, 40)
      }
    }

    void run()

    return () => {
      cancelled = true
      markersRef.current.forEach(m => m.setMap(null))
      markersRef.current = []
      infoWindowsRef.current.forEach(iw => iw.close())
      infoWindowsRef.current = []
    }
  }, [pageReady, sdkLoaded, shows, userCenter, selected])


  // 줌 컨트롤 동일
  const zoomIn = () => { const m = mapObjRef.current; if (!m) return; m.setLevel(Math.max(1, m.getLevel() - 1)) }
  const zoomOut = () => { const m = mapObjRef.current; if (!m) return; m.setLevel(m.getLevel() + 1) }

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <div className={styles.page}>
        {/* 상단 헤더: 주소 표시는 선택 — 원하면 여기도 게이트로 숨길 수 있음 */}


        {!pageReady ? (
          <Spinner />
        ) : (
          <>
            <div className={styles.headerRow}>
              <div className={styles.titleWrap}>
                <i className="fa-solid fa-map-location-dot" />
                <div className={styles.titleBlock}>
                  <h1>내 주변 공연 추천</h1>
                  <p className={styles.addr}>
                    현재 주소:&nbsp;
                    {defaultAddr ? `${defaultAddr?.address || ''}`.trim() : <Spinner />}
                    <button
                      className={styles.addrBtn}
                      type="button"
                      onClick={() => navigate('/mypage/myinfo/address')}
                    >
                      기본 주소 변경
                    </button>
                  </p>
                </div>
              </div>

            </div>
            <div className={`${styles.content} ${selected ? styles.embedMode : ''}`}>
              {selected ? (
                <NearbySpotEmbed festival={selected} onBack={() => setSelected(null)} />
              ) : (
                <>
                  <div className={styles.list}>
                    {shows.map((s) => (
                      <div key={s.id} className={`${styles.card} ${styles.cardAccent}`}>
                        <div className={styles.poster} aria-hidden>
                          {s.poster ? <img src={s.poster} alt={`${s.title} 포스터`} /> : <span>포스터</span>}
                        </div>

                        <div className={styles.meta}>
                          <h3 className={styles.cardTitle}>{s.title}</h3>
                          <div className={styles.venue}>
                            <MapPin className={styles.navIcon} />
                            {s.venue}</div>
                          <div className={styles.distance}>
                            <Navigation className={styles.navIcon} />
                            내 위치로부터 <b>{s.distanceKm != null ? `${s.distanceKm}km` : '-'}</b>
                          </div>

                          <div className={styles.actions}>
                            <Button
                              className={styles.btnGhost}
                              onClick={() =>
                                setSelected({
                                  id: s.id, name: s.title, venue: s.venue, lat: s.lat ?? null, lng: s.lng ?? null,
                                })
                              }
                            >
                              < Utensils className={styles.linkIcon} />
                              주변 볼거리 & 먹거리
                            </Button>
                            <Button className={styles.btnPrimary} onClick={() => navigate(`/festival/${s.id}`)}>
                              < ExternalLink className={styles.linkIcon} />
                              공연 상세 페이지로 이동
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

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
          </>
        )}
      </div>
    </div>
  )
}

export default NearbyShowsPage