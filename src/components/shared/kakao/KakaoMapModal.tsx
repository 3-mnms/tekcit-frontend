// KakaoMapModal.tsx (핵심 부분만)
import React, { useEffect, useRef, useState } from 'react';
import styles from './KakaoMapModal.module.css';
import Modal from '@components/my/ticket/QRModal';
import { loadKakaoMapSdk } from '@/shared/config/loadKakaoMap';

type Props = { isOpen: boolean; onClose: () => void; query: string };

const KakaoMapModal: React.FC<Props> = ({ isOpen, onClose, query }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [sdkError, setSdkError] = useState<string | null>(null);     // ✅ SDK 에러
  const [searchError, setSearchError] = useState<string | null>(null); // ✅ 검색 경고

  useEffect(() => {
    if (!isOpen) return;

    let canceled = false;
    setSdkError(null);     // 🔄 열릴 때마다 초기화
    setSearchError(null);

    (async () => {
      try {
        const kakao = await loadKakaoMapSdk();        // ⬅️ 실패하면 catch로 감
        if (!containerRef.current || canceled) return;

        // 모달 렌더 후 레이아웃 보장
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

        const center = new kakao.maps.LatLng(37.5665, 126.9780); // 서울시청
        const map = new kakao.maps.Map(containerRef.current, { center, level: 5 });
        mapRef.current = map;
        map.relayout();
        map.setCenter(center);

        const geocoder = new kakao.maps.services.Geocoder();
        const places = new kakao.maps.services.Places();

        const tryAddress = () =>
          new Promise<any | null>((resolve) => {
            geocoder.addressSearch(query, (result: any[], status: string) => {
              if (status === kakao.maps.services.Status.OK && result?.length) {
                const { x, y } = result[0];
                resolve(new kakao.maps.LatLng(Number(y), Number(x)));
              } else resolve(null);
            });
          });

        const tryKeyword = () =>
          new Promise<any | null>((resolve) => {
            places.keywordSearch(query, (result: any[], status: string) => {
              if (status === kakao.maps.services.Status.OK && result?.length) {
                const { x, y } = result[0];
                resolve(new kakao.maps.LatLng(Number(y), Number(x)));
              } else resolve(null);
            });
          });

        const pos = (await tryAddress()) ?? (await tryKeyword());
        if (pos) {
          const marker = new kakao.maps.Marker({ position: pos });
          marker.setMap(map);
          markerRef.current = marker;
          map.relayout();
          map.setCenter(pos);
          setSearchError(null); // ✅ 성공했으니 경고 제거
        } else {
          // ✅ 검색 실패는 에러가 아니라 경고(지도는 기본 센터로 표시)
          setSearchError('해당 장소를 찾지 못했어요. (기본 위치 표시 중)');
        }
      } catch (e: any) {
        // ✅ 진짜 SDK 로드 실패일 때만 빨간 에러
        const msg = String(e?.message || '');
        if (msg === 'VITE_KAKAO_MAP_APP_KEY_MISSING') {
          setSdkError('환경변수 VITE_KAKAO_MAP_APP_KEY가 비어있습니다.');
        } else if (msg.includes('DOMAIN') || msg.includes('AUTH') || msg.includes('KAKAO')) {
          setSdkError('카카오 지도 사용 설정(도메인/서비스 활성화/JS키)을 확인해 주세요.');
        } else {
          setSdkError('지도를 불러오지 못했습니다. (네트워크/차단 확장 확인)');
        }
      }
    })();

    return () => {
      canceled = true;
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [isOpen, query]);

  // 리사이즈 시 레이아웃 보정
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const ro = new ResizeObserver(() => {
      const map = mapRef.current;
      if (map) {
        map.relayout();
        if (markerRef.current) map.setCenter(markerRef.current.getPosition());
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [isOpen]);

  const kakaoMapLink = `https://map.kakao.com/?q=${encodeURIComponent(query)}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="지도보기">
      <div className={styles.wrap}>
        <div ref={containerRef} className={styles.map} />
        <div className={styles.footer}>
          {sdkError ? (
            <span className={styles.error}>⚠️ {sdkError}</span>          // 🔴 SDK 에러만 빨간색
          ) : searchError ? (
            <span className={styles.warn}>⚠️ {searchError}</span>       // 🟠 검색 경고는 주황
          ) : (
            <span className={styles.hint}>드래그/휠로 지도를 움직일 수 있어요</span>
          )}
          <a className={styles.link} href={kakaoMapLink} target="_blank" rel="noreferrer">
            카카오맵에서 열기
          </a>
        </div>
      </div>
    </Modal>
  );
};

export default KakaoMapModal;
