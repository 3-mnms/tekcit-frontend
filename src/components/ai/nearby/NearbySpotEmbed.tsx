import React, { useMemo, useState } from 'react';
import styles from './NearbySpotEmbed.module.css';
import { FiMapPin, FiCoffee, FiSmile } from 'react-icons/fi';
import Button from '@/components/common/Button';

type TabKey = 'play' | 'eat' | 'course';

export type NearbyFestivalMini = {
  id: string;
  name: string;
  venue?: string | null;
  lat?: number | null;
  lng?: number | null;
};

type SpotBase = {
  id: string;
  name: string;
  address: string;
  url?: string;
  lat: number;
  lng: number;
  distanceKm: number;
};
type PlayEatSpot = SpotBase & { kind: 'play' | 'eat' };
type CourseSpot = SpotBase & { kind: 'course'; steps: string[] };
type Spot = PlayEatSpot | CourseSpot;

function jitter(center: { lat: number; lng: number }, idx: number) {
  // 클릭한 공연장 주변으로 살짝 흩뿌려서 더미 좌표 생성
  const d = 0.0025 * (idx + 1); // ~200m 간격
  return {
    lat: center.lat + (idx % 2 === 0 ? d : -d),
    lng: center.lng + (idx % 3 === 0 ? d : -d),
  };
}

function buildDummy(center: { lat: number; lng: number }) {
  const p: PlayEatSpot[] = [
    { id: 'p1', kind: 'play', name: '뚝섬 유원지', address: '광진구 자양동 427-6', url: 'https://hangang.seoul.go.kr/', ...jitter(center,0), distanceKm: 1.2 },
    { id: 'p2', kind: 'play', name: '서울숲 산책로', address: '성동구 뚝섬로 273', url: 'https://seoulforest.or.kr/', ...jitter(center,1), distanceKm: 2.8 },
    { id: 'p3', kind: 'play', name: '자전거 대여소', address: '성수동 한강공원 내', url: 'https://bike.seoul.go.kr/', ...jitter(center,2), distanceKm: 1.0 },
  ];
  const e: PlayEatSpot[] = [
    { id: 'e1', kind: 'eat', name: '성수동 카페 거리', address: '성수동 일대', url: 'https://naver.me/xxxxx', ...jitter(center,3), distanceKm: 3.1 },
    { id: 'e2', kind: 'eat', name: '한강 라면포차', address: '뚝섬한강공원', url: 'https://hangang.seoul.go.kr/', ...jitter(center,4), distanceKm: 1.4 },
    { id: 'e3', kind: 'eat', name: '현지 우동집', address: '성동구 아차산로 00', url: 'https://naver.me/yyyyy', ...jitter(center,5), distanceKm: 2.2 },
  ];
  const c: CourseSpot[] = [
    { id: 'c1', kind: 'course', name: '강바람 산책 코스', address: '뚝섬 → 전망 포인트 → 유원지', url: 'https://naver.me/ccccc', ...jitter(center,6), distanceKm: 1.1, steps: ['한강공원 출발','전망 포인트','잔디밭 휴식'] },
    { id: 'c2', kind: 'course', name: '서울숲 감성 코스', address: '서울숲 → 성수 카페 → 수변 데크', url: 'https://naver.me/ddddd', ...jitter(center,7), distanceKm: 2.6, steps: ['메인광장','브런치','수변 데크'] },
    { id: 'c3', kind: 'course', name: '야간 감성 코스', address: '야경 → 푸드트럭 → 포토스팟', url: 'https://naver.me/eeeee', ...jitter(center,8), distanceKm: 1.7, steps: ['야경','포토','야식'] },
  ];
  return { p, e, c };
}

export default function NearbySpotEmbed({
  festival,
  onBack,
}: {
  festival: NearbyFestivalMini;
  onBack: () => void;
}) {
  const center = useMemo(
    () => ({
      lat: festival.lat ?? 37.531,
      lng: festival.lng ?? 127.066,
    }),
    [festival.lat, festival.lng]
  );
  const dummy = useMemo(() => buildDummy(center), [center]);

  const [active, setActive] = useState<TabKey>('play');
  const items: Spot[] = useMemo(() => {
    if (active === 'play') return dummy.p;
    if (active === 'eat') return dummy.e;
    return dummy.c;
  }, [active, dummy]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(
    () => items.find((x) => x.id === selectedId) ?? items[0],
    [items, selectedId]
  );

  return (
    <section className={styles.page} aria-label="주변 추천">
      <header className={styles.headerRow}>
        <div className={styles.titleWrap}>
          <h2 className={styles.pageTitle}>
            {festival.name} 주변 즐길거리 &amp; 맛집 추천
          </h2>
          {festival.venue && <div className={styles.subtitle}>{festival.venue}</div>}
        </div>

        <div className={styles.headerActions}>
          <Button className={styles.backBtn} onClick={onBack}>← 공연 목록으로</Button>
        </div>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="추천 탭">
        <TabButton icon={<FiSmile aria-hidden />} label="놀거리" active={active === 'play'} onClick={() => setActive('play')} />
        <TabButton icon={<FiCoffee aria-hidden />} label="먹거리" active={active === 'eat'} onClick={() => setActive('eat')} />
        <TabButton icon={<FiMapPin aria-hidden />} label="추천 코스" active={active === 'course'} onClick={() => setActive('course')} />
      </div>

      <div className={styles.body}>
        <ul className={styles.list} role="list">
          {items.map((spot) => (
            <li key={spot.id}>
              <SpotCard
                spot={spot}
                active={spot.id === selected?.id}
                onClick={() => setSelectedId(spot.id)}
              />
            </li>
          ))}
        </ul>

        <div className={styles.mapWrap}>
          <div className={styles.mapHeader}>지도</div>
          <div className={styles.mapBox} role="img" aria-label="지도 예시">
            {items.map((s) => {
              const isSel = s.id === selected?.id;
              return (
                <div
                  key={s.id}
                  className={`${styles.pin} ${isSel ? styles.pinActive : ''}`}
                  title={`${s.name} (${s.distanceKm}km)`}
                  style={{
                    left: `${50 + (s.lng - items[0].lng) * 800}%`,
                    top: `${50 - (s.lat - items[0].lat) * 800}%`,
                  }}
                >
                  <FiMapPin />
                </div>
              );
            })}
            <div className={styles.mapNote}>(지도는 예시입니다 · API 연동 예정)</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TabButton({
  icon, label, active, onClick,
}: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
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
  );
}

function SpotCard({
  spot, active, onClick,
}: { spot: Spot; active: boolean; onClick: () => void }) {
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
          <span className={styles.distance}>{spot.distanceKm}km</span>
        </div>
        <div className={styles.addr}>{spot.address}</div>

        {'steps' in spot && spot.steps?.length ? (
          <ul className={styles.courseSteps}>
            {spot.steps.slice(0, 3).map((st, i) => (
              <li key={i}>• {st}</li>
            ))}
          </ul>
        ) : null}

        {spot.url && (
          <a
            href={spot.url}
            target="_blank"
            rel="noreferrer"
            className={styles.link}
            onClick={(e) => e.stopPropagation()}
          >
            {spot.url}
          </a>
        )}
      </div>
    </button>
  );
}
