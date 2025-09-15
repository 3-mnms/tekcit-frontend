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
      } else {
        mapObjRef.current.setCenter(new kakao.maps.LatLng(centerLat, centerLng))
      }

      const map = mapObjRef.current!

      if (openInfoWindowRef.current) {
        openInfoWindowRef.current.close()
        openInfoWindowRef.current = null
      }
      Object.values(infoByIdRef.current).forEach(iw => iw.close())

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
              </div>`
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

      items.slice(0, 3).forEach(s =>
        addMarker(s.id, s.lat, s.lng, s.name, s.address ?? festival.venue ?? '')
      )

      if (active !== 'course' && festival.lat && festival.lng) {
        addMarker(undefined, festival.lat, festival.lng, festival.name, festival.venue ?? '')
      }

      if (!bounds.isEmpty()) {
        map.setBounds(bounds, 50, 50, 50, 50)
      }
    }

    void init()
    return () => {
      cancelled = true
      if (openInfoWindowRef.current) {
        openInfoWindowRef.current.close()
        openInfoWindowRef.current = null
      }
      Object.values(infoByIdRef.current).forEach(iw => iw.close())
      markersRef.current.forEach(m => m.setMap(null))
      markersRef.current = []
    }
  }, [active, items, selectedId, festival, setSelectedId])

  // 🔍 NearbyShowsPage와 동일한 줌 컨트롤
  const zoomIn = () => {
    const m = mapObjRef.current
    if (!m) return
    m.setLevel(Math.max(1, m.getLevel() - 1))
  }
  const zoomOut = () => {
    const m = mapObjRef.current
    if (!m) return
    m.setLevel(m.getLevel() + 1)
  }

  return (
    <div className={styles.mapWrap}>
      <div className={styles.mapHeader}>
        <span>지도 (카카오맵)</span>
        <div className={styles.mapTools}>
          <button type="button" aria-label="확대" onClick={zoomIn}>+</button>
          <button type="button" aria-label="축소" onClick={zoomOut}>−</button>
        </div>
      </div>
      <div ref={mapRef} className={styles.mapBox} aria-label="카카오맵" />
    </div>
  )
}
