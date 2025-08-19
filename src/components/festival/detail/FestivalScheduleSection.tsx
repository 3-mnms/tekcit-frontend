import React, { useMemo, useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { isSameDay, addDays, differenceInCalendarDays, isBefore } from 'date-fns';
import ko from 'date-fns/locale/ko';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './FestivalScheduleSection.module.css';

import { useParams } from 'react-router-dom';
import { useFestivalDetail } from '@/models/festival/tanstack-query/useFestivalDetail';

const ymd = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

const FestivalScheduleSection: React.FC = () => {
  const { fid } = useParams<{ fid: string }>();
  const { data: detail, isLoading, isError, status } = useFestivalDetail(fid ?? '');

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // 오늘 00:00으로 고정
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // 원본 기간 (문자열 → Date)
  const startDate = useMemo(() => (detail?.prfpdfrom ? new Date(detail.prfpdfrom) : undefined), [detail?.prfpdfrom]);
  const endDate   = useMemo(() => (detail?.prfpdto   ? new Date(detail.prfpdto)   : undefined), [detail?.prfpdto]);

  // ✅ 과거 비활성화: 공연 시작일과 오늘 중 "더 늦은" 날을 최소 선택일로
  const effectiveMinDate = useMemo(() => {
    if (!startDate) return today;
    return isBefore(startDate, today) ? today : startDate;
  }, [startDate, today]);

  // 허용 날짜 목록 (from~to 범위, 단 과거 제외)
  const allowedDates = useMemo(() => {
    if (!effectiveMinDate || !endDate) return undefined as Date[] | undefined;
    const days = differenceInCalendarDays(endDate, effectiveMinDate);
    if (!Number.isFinite(days) || days < 0) return undefined;
    return Array.from({ length: days + 1 }, (_, i) => addDays(effectiveMinDate, i));
  }, [effectiveMinDate, endDate]);

  // 시간표 정규화
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

  // 시간이 없으면 기본 버튼 "공연시작"
  const timesToShow = useMemo(
    () => (availableTimes.length > 0 ? availableTimes : ['공연시작']),
    [availableTimes]
  );

  // ✅ 시간이 1개뿐이면 자동 선택, 없으면 해제
  useEffect(() => {
    if (!selectedDate) return;
    if (availableTimes.length === 1) {
      const only = availableTimes[0];
      setSelectedTime((prev) => (prev === only ? prev : only));
    } else if (availableTimes.length === 0) {
      setSelectedTime(null);
    }
  }, [selectedDate, availableTimes]);

  // ✅ 과거 날짜가 선택돼 있으면 해제
  useEffect(() => {
    if (selectedDate && effectiveMinDate && isBefore(selectedDate, effectiveMinDate)) {
      setSelectedDate(null);
      setSelectedTime(null);
    }
  }, [selectedDate, effectiveMinDate]);

  const confirmDisabled = !selectedDate || !selectedTime;

  return (
    <>
      <div className={styles.container}>
        {!fid && <div className={styles.notice}>잘못된 경로입니다.</div>}

        {(isLoading || status === 'idle') && <div className={styles.notice}>일정을 불러오는 중… ⏳</div>}

        {(isError || (!isLoading && status !== 'idle' && !detail)) && (
          <div className={styles.notice}>일정을 불러오지 못했어요 ㅠㅠ</div>
        )}

        {detail && (
          <>
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
                /* ✅ 과거 비활성화 반영 */
                minDate={effectiveMinDate}
                maxDate={endDate}
                includeDates={allowedDates} /* undefined면 전체 허용 */
                dateFormat="yyyy.MM.dd"
                renderDayContents={(day, date) => {
                  // ✅ 캘린더 셀 상태: 과거 비활성, 범위 내 활성
                  const inRange =
                    (!!effectiveMinDate ? !isBefore(date, effectiveMinDate) : true) &&
                    (!!endDate ? !isBefore(endDate, date) : true);

                  const isAvailable =
                    (allowedDates ? allowedDates.some((d) => isSameDay(d, date)) : inRange);

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

            {/* 시간 */}
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
          <div className={styles.actionsRow}>
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
