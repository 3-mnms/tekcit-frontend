import React, { useMemo, useState } from 'react';
import styles from './NearbySpotEmbed.module.css';
import { FiMapPin, FiCoffee, FiSmile } from 'react-icons/fi';
import Button from '@/components/common/Button';
import { useNearbyActivities, pickRecommendForFestival } from '@/models/ai/tanstack-query/useNearbyFestivals';

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
  distanceKm?: number; // 서버에 없으므로 일단 옵션
};
type PlayEatSpot = SpotBase & { kind: 'play' | 'eat' };

export default function NearbySpotEmbed({
  festival,
  onBack,
}: {
  festival: NearbyFestivalMini;
  onBack: () => void;
}) {
  const { data, isLoading, isError, refetch } = useNearbyActivities();
  const rec = useMemo(() => pickRecommendForFestival(data, festival.id), [data, festival.id]);

  // 좌표 기반 핀 배치(거리값은 API에 없으니 표시는 생략)
  const playItems: PlayEatSpot[] = useMemo(
    () =>
      (rec?.hotPlaces ?? []).map((a, i) => ({
        id: `p-${i}`,
        kind: 'play',
        name: a.activityName,
        address: a.addressName,
        lat: a.latitude ?? (festival.lat ?? 37.531),
        lng: a.longitude ?? (festival.lng ?? 127.066),
      })),
    [rec?.hotPlaces, festival.lat, festival.lng]
  );

  const eatItems: PlayEatSpot[] = useMemo(
    () =>
      (rec?.restaurants ?? []).map((a, i) => ({
        id: `e-${i}`,
        kind: 'eat',
        name: a.activityName,
        address: a.addressName,
        lat: a.latitude ?? (festival.lat ?? 37.531),
        lng: a.longitude ?? (festival.lng ?? 127.066),
      })),
    [rec?.restaurants, festival.lat, festival.lng]
  );

  const courseSteps = useMemo(() => {
    const c = rec?.courseDTO;
    return [c?.course1, c?.course2, c?.course3].filter(Boolean) as string[];
  }, [rec?.courseDTO]);

  const [active, setActive] = useState<TabKey>('play');
  const items = active === 'play' ? playItems : active === 'eat' ? eatItems : [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => items.find((x) => x.id === selectedId) ?? items[0], [items, selectedId]);

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

      {/* 상태 처리 */}
      {isLoading && <div className={styles.skeleton}>추천 정보를 불러오는 중…</div>}
      {isError && (
        <div className={styles.error}>
          불러오기에 실패했어요.
          <button className={styles.retry} onClick={() => refetch()}>다시 시도</button>
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
                    {courseSteps.map((st, i) => <li key={i}>{st}</li>)}
                  </ol>
                ) : (
                  <div className={styles.emptySmall}>등록된 코스가 없어요.</div>
                )}
              </li>
            )}
          </ul>

          {/* 우측 지도(플레이스홀더) */}
          <div className={styles.mapWrap}>
            <div className={styles.mapHeader}>지도</div>
            <div className={styles.mapBox} role="img" aria-label="지도 예시">
              {(active !== 'course' ? items.slice(0, 3) : []).map((s) => {
                const isSel = s.id === selected?.id;
                return (
                  <div
                    key={s.id}
                    className={`${styles.pin} ${isSel ? styles.pinActive : ''}`}
                    title={`${s.name}`}
                    style={{
                      left: `${50 + (s.lng - (items[0]?.lng ?? (festival.lng ?? 127.066))) * 800}%`,
                      top: `${50 - (s.lat - (items[0]?.lat ?? (festival.lat ?? 37.531))) * 800}%`,
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
      )}
    </section>
  );
}

function TabButton({
  icon, label, active, onClick,
}: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button role="tab" aria-selected={active} className={`${styles.tab} ${active ? styles.tabActive : ''}`} onClick={onClick} type="button">
      <span className={styles.tabIcon}>{icon}</span>
      {label}
    </button>
  );
}

function SpotCard({
  spot, active, onClick,
}: { spot: PlayEatSpot; active: boolean; onClick: () => void }) {
  return (
    <button className={`${styles.card} ${active ? styles.cardActive : ''}`} onClick={onClick} type="button" aria-pressed={active}>
      <div className={styles.cardBadge} aria-hidden />
      <div className={styles.cardMain}>
        <div className={styles.cardTitleRow}>
          <strong className={styles.cardTitle}>{spot.name}</strong>
        </div>
        <div className={styles.addr}>{spot.address}</div>
      </div>
    </button>
  );
}
