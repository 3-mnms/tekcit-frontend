import React, { useMemo } from 'react';
import styles from './FestivalStatisticsSection.module.css';
import { FaChartBar } from 'react-icons/fa';

type Datum = { label: string; value: number };

const genderData: Datum[] = [
  { label: '남', value: 120 },
  { label: '여', value: 180 },
];

const ageData: Datum[] = [
  { label: '10대 미만', value: 30 },
  { label: '10대', value: 70 },
  { label: '20대', value: 150 },
  { label: '30대', value: 100 },
  { label: '40대', value: 60 },
  { label: '50대 이상', value: 40 },
];

const FestivalStatisticsSection: React.FC = () => {
  const genderTotal = useMemo(
    () => genderData.reduce((s, d) => s + d.value, 0),
    []
  );

  const genderPercent = useMemo(() => {
    const p = genderData.map((d) =>
      genderTotal === 0 ? 0 : Math.round((d.value / genderTotal) * 100)
    );
    const diff = 100 - p.reduce((a, b) => a + b, 0);
    if (diff !== 0 && p.length > 0) p[p.length - 1] += diff;
    return p;
  }, [genderTotal]);

  const genderGradient = useMemo(() => {
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
    []
  );

  return (
    <section className={styles.container} aria-labelledby="stats-title">
      <h3 className={styles.title} id="stats-title">
        <FaChartBar className={styles.icon} />
        판매 정보 상세 내용
      </h3>

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
    </section>
  );
};

export default FestivalStatisticsSection;
