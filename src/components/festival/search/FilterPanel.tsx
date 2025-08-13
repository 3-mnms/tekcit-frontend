import React, { useMemo, useState } from 'react';
import styles from './FilterPanel.module.css';

const WEEK_LABELS = ['일','월','화','수','목','금','토'];

export default function FilterPanel() {
  // 선택 상태
  const [saleStatus, setSaleStatus] = useState<string[]>(['판매중','판매예정']); // 기본 선택
  const [genres, setGenres] = useState<string[]>([]);   // 기본 없음
  const [regions, setRegions] = useState<string[]>([]); // 기본 없음

  // 달력 상태
  const today = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate()); // 00:00으로 정규화
  }, []);
  const [viewDate, setViewDate] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  // ✅ 기간 선택 상태 (start/end)
  const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  const y = viewDate.getFullYear();
  const m = viewDate.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const firstDayIdx = new Date(y, m, 1).getDay();

  const padMonth = (n: number) => String(n).padStart(2, '0');
  const title = `${y}.${padMonth(m + 1)}`;

  const toggle = (list: string[], value: string, setter: (v: string[]) => void) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const prevMonth = () => setViewDate(new Date(y, m - 1, 1));
  const nextMonth = () => setViewDate(new Date(y, m + 1, 1));

  // 날짜 유틸
  const strip = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const inBetween = (d: Date, s: Date, e: Date) => strip(d) >= strip(s) && strip(d) <= strip(e);

  // ✅ 클릭: 시작 → 종료 → 다시 시작
  const handleDayClick = (dateObj: Date) => {
    const d = strip(dateObj);
    if (!range.start || (range.start && range.end)) {
      // 새 범위 시작
      setRange({ start: d, end: null });
    } else if (range.start && !range.end) {
      // 종료 선택(역순 클릭해도 자동 정렬)
      if (d < range.start) setRange({ start: d, end: range.start });
      else setRange({ start: range.start, end: d });
    }
  };

  return (
    <aside className={styles.wrap}>
      <div className={styles.inner}>
        {/* ----------------- 스크롤 되는 본문 ----------------- */}
        <div className={styles.body}>
          <h3 className={styles.title}>필터</h3>

          {/* 장르 */}
          <section className={styles.section}>
            <div className={styles.labelRow}>
              <span className={styles.label}>장르</span>
              <span className={styles.helper}>(중복 선택 가능)</span>
            </div>
            <div className={styles.chips}>
              {['콘서트', '뮤지컬', '연극', '페스티벌'].map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`${styles.chip} ${genres.includes(g) ? styles.chipActive : ''}`}
                  onClick={() => toggle(genres, g, setGenres)}
                  aria-pressed={genres.includes(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </section>

          <div className={styles.divider} />

          {/* 판매상태 */}
          <section className={styles.section}>
            <div className={styles.labelRow}>
              <span className={styles.label}>판매상태</span>
            </div>
            <div className={styles.chips}>
              {['판매중', '판매예정', '판매종료'].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`${styles.chip} ${saleStatus.includes(s) ? styles.chipActive : ''}`}
                  onClick={() => toggle(saleStatus, s, setSaleStatus)}
                  aria-pressed={saleStatus.includes(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          <div className={styles.divider} />

          {/* 날짜 */}
          <section className={styles.section}>
            <div className={styles.labelRow}>
              <span className={styles.label}>날짜</span>
            </div>

            <div className={styles.calendarCard}>
              <div className={styles.calHeader}>
                <button className={styles.navBtn} onClick={prevMonth} aria-label="이전 달">‹</button>
                <strong className={styles.calTitle}>{title}</strong>
                <button className={styles.navBtn} onClick={nextMonth} aria-label="다음 달">›</button>
              </div>

              <div className={styles.weekRow}>
                {WEEK_LABELS.map((d) => <span key={d}>{d}</span>)}
              </div>

              <div className={styles.daysGrid}>
                {/* 시작 요일 공백 */}
                {Array.from({ length: firstDayIdx }).map((_, i) => (
                  <span key={`b${i}`} />
                ))}

                {/* 실제 날짜 */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const day = idx + 1;
                  const dateObj = new Date(y, m, day);
                  const isPast = strip(dateObj) < today; // 오늘 이전 비활성

                  const isStart = !!(range.start && sameDay(dateObj, range.start));
                  const isEnd   = !!(range.end && sameDay(dateObj, range.end));
                  const isInRange = !!(range.start && range.end && inBetween(dateObj, range.start, range.end));

                  return (
                    <button
                      key={day}
                      type="button"
                      className={[
                        styles.dayBtn,
                        isPast ? styles.dayBtnDisabled : '',
                        isInRange ? styles.dayInRange : '',
                        isStart ? styles.dayStart : '',
                        isEnd ? styles.dayEnd : '',
                      ].join(' ')}
                      onClick={() => !isPast && handleDayClick(dateObj)}
                      disabled={isPast}
                      aria-pressed={isStart || isEnd || isInRange}
                    >
                      <span className={styles.dayNum}>{day}</span>
                      {sameDay(dateObj, today) && <span className={styles.todayTag}>today</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <div className={styles.divider} />
        </div>

        {/* ----------------- 항상 보이는 하단 바 ----------------- */}
        <div className={styles.actions}>
          <button
            className={styles.btnGhost}
            type="button"
            onClick={() => {
              setGenres([]);
              setRegions([]);
              setSaleStatus(['판매중','판매예정']);
              setRange({ start: null, end: null }); // ✅ 기간 초기화
              setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
            }}
          >
            초기화
          </button>
          {/* ✅ selectedCount 제거 → 고정 라벨 */}
          <button className={styles.btnPrimary} type="button">
            필터 적용
          </button>
        </div>
      </div>
    </aside>
  );
}
