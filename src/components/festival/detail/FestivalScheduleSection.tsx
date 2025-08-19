// components/festival/detail/FestivalScheduleSection.tsx
import React, { useMemo, useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { isSameDay, addDays, differenceInCalendarDays } from 'date-fns';
import ko from 'date-fns/locale/ko'; // ✅ locale import (no hook)
import 'react-datepicker/dist/react-datepicker.css';
import styles from './FestivalScheduleSection.module.css';

import { useParams } from 'react-router-dom';
import { useFestivalDetail } from '@/models/festival/tanstack-query/useFestivalDetail';

// YYYY-MM-DD (타임존 영향 최소화)
const ymd = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

const FestivalScheduleSection: React.FC = () => {
  // ✅ 훅은 항상 같은 순서로 호출
  const { fid } = useParams<{ fid: string }>();
  const { data: detail, isLoading, isError, status } = useFestivalDetail(fid ?? '');

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // ===== 파생값 계산도 훅은 항상 호출 =====
  const prfpdfrom = detail?.prfpdfrom;
  const prfpdto = detail?.prfpdto;
  const ticketPrice = detail?.ticketPrice;

  const minDate = useMemo(() => (prfpdfrom ? new Date(prfpdfrom) : undefined), [prfpdfrom]);
  const maxDate = useMemo(() => (prfpdto ? new Date(prfpdto) : undefined), [prfpdto]);

  const allowedDates = useMemo(() => {
    if (!minDate || !maxDate) return undefined as Date[] | undefined;
    const days = differenceInCalendarDays(maxDate, minDate);
    if (!Number.isFinite(days) || days < 0) return undefined;
    return Array.from({ length: days + 1 }, (_, i) => addDays(minDate, i));
  }, [minDate, maxDate]);

  // 시간표 정규화(있어도, 없어도 안정적으로)
  const timeTable: Record<string, string[]> = useMemo(() => {
    const raw: unknown = (detail as any)?.timeTable;
    if (!raw) return {};
    if (Array.isArray(raw)) {
      return raw.reduce<Record<string, string[]>>((acc, cur: any) => {
        const key = cur?.date;
        const times = Array.isArray(cur?.times) ? cur.times : [];
        if (typeof key === 'string') acc[key] = times;
        return acc;
      }, {});
    }
    if (typeof raw === 'object') {
      return Object.entries(raw as Record<string, unknown>).reduce<Record<string, string[]>>(
        (acc, [k, v]) => {
          acc[k] = Array.isArray(v) ? (v as string[]) : [];
          return acc;
        },
        {}
      );
    }
    return {};
  }, [detail]);

  const availableTimes = useMemo(() => {
    if (!selectedDate) return [] as string[];
    const key = ymd(selectedDate);
    return timeTable[key] ?? [];
  }, [selectedDate, timeTable]);

  // 시간이 없으면 기본 버튼 "공연시작" 하나 노출
  const timesToShow = useMemo(
    () => (availableTimes.length > 0 ? availableTimes : ['공연시작']),
    [availableTimes]
  );

  const confirmDisabled = !selectedDate || !selectedTime;

  // ===== 렌더(조건 분기는 JSX에서만) =====
  return (
    <>
      <div className={styles.container}>
        {!fid && <div className={styles.notice}>잘못된 경로입니다.</div>}

        {(isLoading || status === 'idle') && (
          <div className={styles.notice}>일정을 불러오는 중… ⏳</div>
        )}

        {(isError || (!isLoading && status !== 'idle' && !detail)) && (
          <div className={styles.notice}>일정을 불러오지 못했어요 ㅠㅠ</div>
        )}

        {detail && (
          <>
            {/* 관람일 */}
            <p className={styles.title}>관람일</p>
            <div className={styles.datepickerWrapper}>
              <DatePicker
                inline
                locale={ko}
                selected={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  setSelectedTime(null);
                }}
                minDate={minDate}
                maxDate={maxDate}
                includeDates={allowedDates} // undefined면 전체 허용
                dateFormat="yyyy.MM.dd"
                renderDayContents={(day, date) => {
                  const isAvailable =
                    !allowedDates || allowedDates.some((d) => isSameDay(d, date));
                  const isSelected = selectedDate && isSameDay(date, selectedDate);
                  return (
                    <div
                      className={`${styles.day} ${isAvailable ? styles.active : styles.inactive} ${
                        isSelected ? styles.selected : ''
                      }`}
                    >
                      {day}
                    </div>
                  );
                }}
              />
            </div>

            {/* 시간(없으면 '공연시작' 버튼 1개) */}
            <div className={styles.section}>
              <p className={styles.label}>시간</p>
              <div className={styles.timeGroup}>
                {timesToShow.map((time) => (
                  <button
                    key={time}
                    className={`${styles.timeBtn} ${selectedTime === time ? styles.selectedBtn : ''}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {detail && (
        <div className={styles.section}>
          <div className={styles.priceRow}>
            <span className={styles.price}>
              {typeof ticketPrice === 'number' ? ticketPrice.toLocaleString() + '원' : ''}
            </span>
            <button
              className={styles.confirmBtn}
              disabled={confirmDisabled}
              onClick={() => {
                if (!selectedDate) return;
                const payload = { date: ymd(selectedDate), time: selectedTime ?? '' };
                alert(`${payload.date} ${payload.time || ''} 예매 시작!`);
              }}
            >
              예매하기
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FestivalScheduleSection;
