import React, { useMemo, useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { isSameDay } from 'date-fns';
import ko from 'date-fns/locale/ko';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './FestivalScheduleSection.module.css';

import { useParams } from 'react-router-dom';
import { useFestivalDetail } from '@/models/festival/tanstack-query/useFestivalDetail';

/** YYYY-MM-DD */
const ymd = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

/** 안전 파서 */
const parseYMD = (s?: string): Date | undefined => {
  if (!s) return;
  const norm = String(s).trim().replace(/[./]/g, '-').replace(/\s+\d{2}:\d{2}(:\d{2})?$/, '');
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(norm);
  const d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(norm);
  if (isNaN(d.getTime())) return;
  d.setHours(0, 0, 0, 0);
  return d;
};

/** 요일 정규화 → 0~6 */
const toJsDow = (raw?: string): number | undefined => {
  if (raw == null) return;
  const s = String(raw).trim().toUpperCase();
  if (/^[0-6]$/.test(s)) return Number(s);
  const three = s.replace(/[^A-Z]/g, '').slice(0, 3);
  const map: Record<string, number> = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };
  return map[three];
};

const openbookingPopup = (fid: number, date: Date, time?: string | null) => {
  const width = 1000;
  const height = 600;

  // 브라우저 화면 중앙 계산
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const url = `/booking/${fid}?date=${ymd(date)}&time=${encodeURIComponent(time ?? '')}`;

  window.open(url, '_blank', `width=${width},height=${height},left=${left},top=${top},noopener,noreferrer`);
};

const FestivalScheduleSection: React.FC = () => {
  const { fid } = useParams<{ fid: string }>();
  const { data: detail, isLoading, isError, status } = useFestivalDetail(fid ?? '');

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  /** 오늘 00:00 */
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  /** 기간 파싱 */
  const startDate = useMemo(() => parseYMD((detail as any)?.prfpdfrom as any), [detail?.prfpdfrom]);
  const endDate = useMemo(() => parseYMD((detail as any)?.prfpdto as any), [detail?.prfpdto]);
  const isSingleDay = !!startDate && !!endDate && isSameDay(startDate, endDate);

  /** 과거 비활성: 시작일 vs 오늘 중 늦은 날 */
  const effectiveMinDate = useMemo(() => {
    if (!startDate) return today;
    return startDate < today ? today : startDate;
  }, [startDate, today]);

  /** 공연 요일 집합 (비어있으면 요일 제한 없음) */
  const allowedDowSet = useMemo(() => {
    const src = ((detail as any)?.daysOfWeek ?? []) as Array<string | null | undefined>;
    const set = new Set<number>();
    for (const v of src) {
      const n = toJsDow(v ?? undefined);
      if (n !== undefined) set.add(n);
    }
    return set;
  }, [detail?.daysOfWeek]);

  /** 날짜 선택 가능 판정: 기간 + (단일일자 특례) + 요일 */
  const isSelectableDate = (date: Date) => {
    if (effectiveMinDate && date < effectiveMinDate) return false;
    if (endDate && date > endDate) return false;

    if (isSingleDay && endDate) return isSameDay(date, endDate);

    if (allowedDowSet.size > 0 && !allowedDowSet.has(date.getDay())) return false;

    return true;
  };

  /** 네비 가능한 최소/최대 (활성 날짜가 있는 달로 제한) */
  const [minNavDate, maxNavDate] = useMemo(() => {
    if (!endDate) {
      const seed = effectiveMinDate ?? startDate ?? today;
      return [seed, seed];
    }
    if (isSingleDay && endDate) return [endDate, endDate];

    let first: Date | undefined;
    let last: Date | undefined;

    // 앞으로 검색
    {
      const d = new Date(effectiveMinDate ?? today);
      for (let i = 0; i < 730 && d <= endDate; i++) {
        if (isSelectableDate(d)) { first = new Date(d); break; }
        d.setDate(d.getDate() + 1);
      }
    }
    // 뒤로 검색
    {
      const d = new Date(endDate);
      for (let i = 0; i < 730 && d >= (effectiveMinDate ?? today); i++) {
        if (isSelectableDate(d)) { last = new Date(d); break; }
        d.setDate(d.getDate() - 1);
      }
    }

    const minD = first ?? (effectiveMinDate ?? startDate ?? today);
    const maxD = last ?? (endDate ?? minD);
    return [minD, maxD];
  }, [effectiveMinDate, endDate, startDate, today, isSingleDay]);

  /** 시작시간 목록: DTO times → 중복 제거 후 정렬 */
  const baseTimes = useMemo(() => {
    const t = ((detail as any)?.times ?? []) as string[];
    const unique = Array.from(
      new Set(
        t
          .map((s) => (typeof s === 'string' ? s.trim() : ''))
          .filter(Boolean)
      )
    );
    // "HH:mm" 레क्स 정렬 → 시간 오름차순
    unique.sort();
    return unique;
  }, [detail?.times]);

  /** 선택된 날짜의 표시 시간들 (현재는 날짜별 동일 시간표) */
  const availableTimes = useMemo(() => {
    if (!selectedDate) return [] as string[];
    return baseTimes;
  }, [selectedDate, baseTimes]);

  /** 시간이 없으면 기본 버튼 "공연시작" (단, 실제 times가 없을 때만) */
  const timesToShow = useMemo(
    () => (availableTimes.length > 0 ? availableTimes : ['공연시작']),
    [availableTimes]
  );

  /** 사용자가 날짜를 바꾸면 자동으로 "첫 시간" 선택 */
  useEffect(() => {
    if (!selectedDate) return;
    if (availableTimes.length > 0) {
      const first = availableTimes[0]; // 이미 정렬되어 있음
      setSelectedTime(first);
    } else {
      setSelectedTime(null);
    }
  }, [selectedDate, availableTimes]);

  /** 최초 로딩 시: 오늘 기준 가장 빠른 선택 가능 날짜 + 그 날의 가장 빠른 시간 자동 선택 */
  useEffect(() => {
    if (!detail) return;
    // 이미 사용자가 선택한 상태면 건드리지 않음
    if (selectedDate && selectedTime) return;

    // 1) 가장 빠른 선택 가능 날짜 찾기
    let initialDate: Date | null = null;
    if (isSingleDay && endDate) {
      initialDate = endDate; // 단일 일자는 그 날로
    } else {
      // 기간 안에서 오늘부터 앞으로 스캔
      if (endDate) {
        const startScan = new Date(effectiveMinDate ?? today);
        for (let i = 0; i < 730 && startScan <= endDate; i++) {
          if (isSelectableDate(startScan)) { initialDate = new Date(startScan); break; }
          startScan.setDate(startScan.getDate() + 1);
        }
      } else if (effectiveMinDate) {
        // endDate가 없다면 최소일만 후보
        initialDate = effectiveMinDate;
      }
    }

    // 2) 시간 선택: dedupe+정렬 된 baseTimes의 첫 번째(있을 경우)
    const initialTime = (baseTimes.length > 0) ? baseTimes[0] : null;

    // 3) 상태 반영
    if (initialDate) setSelectedDate((prev) => prev ?? initialDate);
    if (initialTime) setSelectedTime((prev) => prev ?? initialTime);
  }, [detail, isSingleDay, endDate, effectiveMinDate, today, baseTimes, selectedDate, selectedTime]);

  const confirmDisabled = !selectedDate || !selectedTime;

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
            <p className={styles.title}>관람일</p>
            <div className={styles.datepickerWrapper}>
              <DatePicker
                inline
                locale={ko}
                selected={selectedDate}
                onChange={(d) => {
                  setSelectedDate(d);
                  // 시간은 useEffect에서 첫 시간 자동 선택
                }}
                minDate={minNavDate}
                maxDate={maxNavDate}
                filterDate={isSelectableDate}
                openToDate={minNavDate}
                dayClassName={(date) => {
                  const selectable = isSelectableDate(date);
                  const isSel = selectedDate && isSameDay(date, selectedDate);
                  return [
                    'custom-day',
                    selectable ? 'day-active' : 'day-inactive',
                    isSel ? 'day-selected' : '',
                  ].join(' ');
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
                openbookingPopup(fid, selectedDate, selectedTime);
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
