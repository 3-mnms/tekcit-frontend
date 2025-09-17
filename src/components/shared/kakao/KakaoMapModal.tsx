import React, { useEffect, useRef, useState } from 'react'
import styles from './KakaoMapModal.module.css'
import { loadKakaoMapSdk } from '@/shared/config/loadKakaoMap'

type Props = { isOpen: boolean; onClose: () => void; query: string }

const KakaoMapModal: React.FC<Props> = ({ isOpen, onClose, query }) => {
  // ⬇️ isOpen이 false면 아예 렌더하지 않음 (핵심 수정)
  if (!isOpen) return null

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const markerRef = useRef<kakao.maps.Marker | null>(null)

  const [sdkError, setSdkError] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)

  // ESC로 닫기 + 바디 스크롤 잠금
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  useEffect(() => {
    let canceled = false
    setSdkError(null)
    setSearchError(null)

    ;(async () => {
      try {
        const kakaoNS = await loadKakaoMapSdk()
        if (!containerRef.current || canceled) return

        // 모달 오픈 직후 레이아웃 안정화
        await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(r)))

        const center = new kakaoNS.maps.LatLng(37.5665, 126.978)

        const map =
          mapRef.current ?? new kakaoNS.maps.Map(containerRef.current, { center, level: 5 })
        mapRef.current = map
        map.relayout()
        map.setCenter(center)

        const trimmed = query.trim()
        if (!trimmed) {
          setSearchError('검색어가 비어 있어 기본 위치를 표시합니다.')
          if (markerRef.current) {
            markerRef.current.setMap(null)
            markerRef.current = null
          }
          return
        }

        const geocoder = new kakaoNS.maps.services.Geocoder()
        const places = new kakaoNS.maps.services.Places()

        const tryAddress = () =>
          new Promise<kakao.maps.LatLng | null>((resolve) => {
            geocoder.addressSearch(trimmed, (result, status) => {
              if (status === kakaoNS.maps.services.Status.OK && result?.length) {
                const { x, y } = result[0]
                resolve(new kakaoNS.maps.LatLng(Number(y), Number(x)))
              } else resolve(null)
            })
          })

        const tryKeyword = () =>
          new Promise<kakao.maps.LatLng | null>((resolve) => {
            places.keywordSearch(trimmed, (result, status) => {
              if (status === kakaoNS.maps.services.Status.OK && result?.length) {
                const { x, y } = result[0]
                resolve(new kakaoNS.maps.LatLng(Number(y), Number(x)))
              } else resolve(null)
            })
          })

        const pos = (await tryAddress()) ?? (await tryKeyword())

        // 기존 마커 제거
        if (markerRef.current) {
          markerRef.current.setMap(null)
          markerRef.current = null
        }

        if (pos) {
          const marker = new kakaoNS.maps.Marker({ position: pos })
          marker.setMap(map)
          markerRef.current = marker
          map.relayout()
          map.setCenter(pos)
          setSearchError(null)
        } else {
          setSearchError('해당 장소를 찾지 못했어요. (기본 위치 표시 중)')
          map.setCenter(center)
        }
      } catch (e: unknown) {
        const msg = String((e as Error)?.message || '')
        if (msg === 'VITE_KAKAO_MAP_APP_KEY_MISSING') {
          setSdkError('환경변수 VITE_KAKAO_MAP_APP_KEY가 비어있습니다.')
        } else if (msg.includes('DOMAIN') || msg.includes('AUTH') || msg.includes('KAKAO')) {
          setSdkError('카카오 지도 사용 설정(도메인/서비스 활성화/JS키)을 확인해 주세요.')
        } else {
          setSdkError('지도를 불러오지 못했습니다. (네트워크/차단 확장 확인)')
        }
      }
    })()

    return () => {
      canceled = true
      if (markerRef.current) {
        markerRef.current.setMap(null)
        markerRef.current = null
      }
    }
  }, [isOpen, query])

  const kakaoMapLink = `https://map.kakao.com/?q=${encodeURIComponent(query)}`

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      {/* 콘텐츠 클릭 시 닫히지 않도록 버블링 방지 */}
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.wrap}>
          <div ref={containerRef} className={styles.map} />
          <div className={styles.footer}>
            {sdkError ? (
              <span className={styles.error}>⚠️ {sdkError}</span>
            ) : searchError ? (
              <span className={styles.warn}>⚠️ {searchError}</span>
            ) : (
              <span className={styles.hint}>드래그/휠로 지도를 움직일 수 있어요</span>
            )}
            <a className={styles.link} href={kakaoMapLink} target="_blank" rel="noreferrer">
              카카오맵에서 열기
            </a>
          </div>
        </div>

        <button className={styles.closeBtn} onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  )
}

export default KakaoMapModal
