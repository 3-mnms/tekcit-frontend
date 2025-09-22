// src/components/festival/detail/FestivalStatisticsSection.tsx
import React, { useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import styles from './FestivalStatisticsSection.module.css';
import { FaChartBar } from 'react-icons/fa';
import { useFestivalUserStatistics } from '@/models/statistics/tanstack-query/useFestivalUserStatisticsDetail';
import Spinner from '@/components/common/spinner/Spinner';

type Datum = { label: string; value: number };
const AGE_ORDER = ['10대', '20대', '30대', '40대', '50대 이상'];

function useFestivalId(): string {
  const params = useParams<Record<string, string | undefined>>();
  const location = useLocation();

  const fromParams =
    params.festivalId ?? params.fid ?? params.id ?? '';

  const search = new URLSearchParams(location.search);
  const fromQuery =
    search.get('festivalId') ?? search.get('fid') ?? search.get('id') ?? '';

  const fromPath = (() => {
    const m = location.pathname.match(/\/festival\/([^/?#]+)/i);
    return m?.[1] ?? '';
  })();

  return (fromParams || fromQuery || fromPath).trim();
}

const FestivalStatisticsSection: React.FC = () => {
  // ✅ 훅은 항상 호출!
  const festivalId = useFestivalId();

  const { data, isLoading, isError, error, refetch, isFetching } =
    useFestivalUserStatistics(festivalId, { enabled: !!festivalId });

  // DTO -> 시각화 데이터 (훅 이후에 메모만)
  const genderData: Datum[] = useMemo(() => {
    const gc = data?.genderCount ?? {};
    const male = gc.male ?? gc.MALE ?? gc['남'] ?? gc['남성'] ?? 0;
    const female = gc.female ?? gc.FEMALE ?? gc['여'] ?? gc['여성'] ?? 0;
    return [
      { label: '남', value: male },
      { label: '여', value: female },
    ];
  }, [data]);

  const ageData: Datum[] = useMemo(() => {
    const src = data?.ageGroupCount ?? {};
    const keys = Array.from(new Set([...AGE_ORDER, ...Object.keys(src)]));
    return keys.map((k) => ({ label: k, value: src[k] ?? 0 }));
  }, [data]);

  const genderTotal = useMemo(
    () => genderData.reduce((s, d) => s + d.value, 0),
    [genderData]
  );

  const genderPercent = useMemo(() => {
    if (genderTotal === 0) {
      // 아무도 없으면 0% / 0%
      return genderData.map(() => 0);
    }
    const p = genderData.map((d) =>
      genderTotal === 0 ? 0 : Math.round((d.value / genderTotal) * 100)
    );
    const diff = 100 - p.reduce((a, b) => a + b, 0);
    if (diff !== 0 && p.length > 0) p[p.length - 1] += diff;
    return p;
  }, [genderData, genderTotal]);

  const genderGradient = useMemo(() => {
    if (genderTotal === 0) {
      // 중립(회색) 한 색으로 표시해서 '데이터 없음' 느낌
      return 'conic-gradient(#e5e7eb 0% 100%)'; // tailwind gray-200 정도 느낌
    }
    const colors = ['#4D9AFD', '#FF7EB9'];
    let start = 0;
    const stops: string[] = [];
    genderPercent.forEach((pct, i) => {
      const end = start + pct;
      stops.push(`${colors[i % colors.length]} ${start}% ${end}%`);
      start = end;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }, [genderPercent]);

  const ageTotal = useMemo(
    () => ageData.reduce((s, d) => s + d.value, 0),
    [ageData]
  );

  // ✅ 한 번의 return 안에서 분기 렌더링(훅 호출 순서 불변)
  return (
    <section className={styles.container} aria-labelledby="stats-title">
      <h3 className={styles.title} id="stats-title">
        <FaChartBar className={styles.icon} />
        판매 정보 상세 내용
      </h3>

      {!festivalId && (
        <div>축제 정보가 없어요 😿</div>
      )}

      {!!festivalId && isLoading && (
        <Spinner />
      )}

      {!!festivalId && isError && (
        <div role="alert">
          불러오기에 실패했어요: {(error as Error)?.message}
          <button onClick={() => refetch()} disabled={isFetching} style={{ marginLeft: 8 }}>
            다시 시도
          </button>
        </div>
      )}

      {!!festivalId && !isLoading && !isError && (
        <div className={styles.grid}>
          {/* 성별 도넛 차트 */}
          <div className={styles.card} aria-label="성별 통계">
            <div className={styles.cardHead}>
              <strong>성별 통계</strong>
            </div>

            <div className={styles.genderWrap}>
              <div className={styles.donut}>
                <div
                  className={styles.donutRing}
                  style={{ background: genderGradient }}
                  role="img"
                  aria-label={`남 ${genderPercent[0]}%, 여 ${genderPercent[1]}%`}
                />
                <div className={styles.donutCenter}>
                  <div className={styles.centerMain}>
                    {genderPercent[0]}% / {genderPercent[1]}%
                  </div>
                  <div className={styles.centerSub}>남 / 여</div>
                </div>
              </div>

              <ul className={styles.legend} role="list">
                {genderData.map((d, i) => (
                  <li key={d.label} className={styles.legendItem}>
                    <span
                      className={styles.swatch}
                      style={{ backgroundColor: i === 0 ? '#4D9AFD' : '#FF7EB9' }}
                    />
                    <span className={styles.legendLabel}>{d.label}</span>
                    <span className={styles.legendValue}>
                      {genderPercent[i]}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 연령대 막대 그래프 */}
          <div className={styles.card} aria-label="연령대 통계">
            <div className={styles.cardHead}>
              <strong>연령대 통계</strong>
            </div>

            <div className={styles.ageBars} role="list">
              {ageData.map((d) => {
                const pct = ageTotal === 0 ? 0 : Math.round((d.value / ageTotal) * 100);
                return (
                  <div key={d.label} className={styles.ageRow} role="listitem">
                    <div className={styles.ageLabel}>{d.label}</div>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{ width: `${pct}%` }}
                        title={`${pct}%`}
                      />
                    </div>
                    <div className={styles.ageValue}>{pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default FestivalStatisticsSection;
