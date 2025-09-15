import React, { useEffect, useRef } from 'react'
import styles from './NearbySpotEmbed.module.css'
import { loadKakaoMapSdk } from '@/shared/config/loadKakaoMap'
import type { NearbyFestivalMini } from './NearbySpotEmbed'
import type { PlayEatSpot } from './SpotCard'

interface Props {
    festival: NearbyFestivalMini
    items: PlayEatSpot[]
    active: 'play' | 'eat' | 'course'
    selectedId: string | null
    setSelectedId: (id: string) => void
}

export default function MapView({ festival, items, active, selectedId, setSelectedId }: Props) {
    const mapRef = useRef<HTMLDivElement | null>(null)
    const mapObjRef = useRef<kakao.maps.Map | null>(null)
    const markersRef = useRef<kakao.maps.Marker[]>([])
    const markerByIdRef = useRef<Record<string, kakao.maps.Marker>>({})
    const infoByIdRef = useRef<Record<string, kakao.maps.InfoWindow>>({})
    const openInfoWindowRef = useRef<kakao.maps.InfoWindow | null>(null)

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
            const map = mapObjRef.current!

            // ✅ 먼저 열려 있던 InfoWindow/저장된 InfoWindow 모두 닫기
            if (openInfoWindowRef.current) {
                openInfoWindowRef.current.close()
                openInfoWindowRef.current = null
            }
            Object.values(infoByIdRef.current).forEach(iw => iw.close())

            // ✅ 기존 마커 제거 & 레퍼런스 초기화
            markersRef.current.forEach(m => m.setMap(null))
            markersRef.current = []
            markerByIdRef.current = {}
            infoByIdRef.current = {}

            const bounds = new kakao.maps.LatLngBounds()

            const addMarker = (
                id: string | undefined,
                lat: number,
                lng: number,
                label?: string,
                address?: string
            ) => {
                const pos = new kakao.maps.LatLng(lat, lng)
                const marker = new kakao.maps.Marker({ position: pos, map })
                markersRef.current.push(marker)
                bounds.extend(pos)

                let iw: kakao.maps.InfoWindow | undefined
                if (label) {
                    iw = new kakao.maps.InfoWindow({
                        content: `
            <div style="box-sizing:border-box;max-width:240px;padding:6px 8px;
                        font-size:12px;line-height:1.4;white-space:normal;
                        word-break:break-word;overflow-wrap:anywhere;">
              <b style="display:block;margin-bottom:2px;">${label}</b>
              ${address ? `<span style="color:#666">${address}</span>` : ""}
            </div>`,
                    })
                    kakao.maps.event.addListener(marker, 'mouseover', () => iw!.open(map, marker))
                    kakao.maps.event.addListener(marker, 'mouseout', () => iw!.close())
                    kakao.maps.event.addListener(marker, 'click', () => {
                        if (openInfoWindowRef.current) openInfoWindowRef.current.close()
                        iw!.open(map, marker)
                        openInfoWindowRef.current = iw!
                        if (id) setSelectedId(id)
                        map.setCenter(marker.getPosition())
                    })
                }

                if (id) {
                    markerByIdRef.current[id] = marker
                    if (iw) infoByIdRef.current[id] = iw
                }
            }

            // 이번 탭의 핀만 그림
            items.slice(0, 3).forEach(s =>
                addMarker(s.id, s.lat, s.lng, s.name, s.address ?? festival.venue ?? '')
            )

            // 공연장 핀은 함께
            if (active !== 'course' && festival.lat && festival.lng) {
                addMarker(undefined, festival.lat, festival.lng, festival.name, festival.venue ?? '')
            }

            if (!bounds.isEmpty()) {
                map.setBounds(bounds, 50, 50, 50, 50)
            } else {
                map.setCenter(new kakao.maps.LatLng(centerLat, centerLng))
            }

            // 카드 선택되어 있으면 그 정보창만 다시 열기
            if (selectedId) {
                const marker = markerByIdRef.current[selectedId]
                const iw = infoByIdRef.current[selectedId]
                if (marker && iw) {
                    iw.open(map, marker)
                    openInfoWindowRef.current = iw
                    map.setCenter(marker.getPosition())
                }
            }
        }

        void init()
        return () => {
            cancelled = true
            // 언마운트 혹은 의존성 변경 시 확실히 닫고 정리
            if (openInfoWindowRef.current) {
                openInfoWindowRef.current.close()
                openInfoWindowRef.current = null
            }
            Object.values(infoByIdRef.current).forEach(iw => iw.close())
            markersRef.current.forEach(m => m.setMap(null))
            markersRef.current = []
        }
    }, [active, items, selectedId, festival, setSelectedId])


    return (
        <div className={styles.mapWrap}>
            <div className={styles.mapHeader}>지도</div>
            <div ref={mapRef} className={styles.mapBox} aria-label="카카오맵" />
        </div>
    )
}
