import React, { useMemo, useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './FestivalScheduleSection.module.css';
import Button from '@/components/common/button/Button';

import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useFestivalDetail } from '@/models/festival/tanstack-query/useFestivalDetail';
import { useAuthStore } from '@/shared/storage/useAuthStore';
import { useUserAgeQuery } from '@/models/festival/tanstack-query/useUserAgeDetail';

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

const openbookingPopup = (
  fid: string | number,
  date: Date,
  time?: string | null,
  fdfrom?: string | null,
  fdto?: string | null
) => {
  const width = 1000;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const params = new URLSearchParams();
  params.set('date', ymd(date));
  if (time) params.set('time', time);
  if (fdfrom) params.set('fdfrom', fdfrom);
  if (fdto) params.set('fdto', fdto);

  const url = `/booking/${fid}?${params.toString()}`;

  window.open(
    url,
    '_blank',
    `width=${width},height=${height},left=${left},top=${top},noopener,noreferrer`
  );
};

/* =========================
   ✅ 연령 체크 유틸들
   ========================= */

/** 관람연령 문자열에서 최소 나이 추출 (없으면 null, 전체관람가/전연령 등은 0) */
function parseMinAge(raw?: string | null): number | null {
  if (!raw) return null;
  const s = String(raw).replace(/\s+/g, '');
  // 전체/전연령
  if (/(전체관람가|전연령|ALL)/i.test(s)) return 0;

  // "만7세이상" / "7세이상" / "만 12세 이상" 등
  const m = s.match(/(?:만)?(\d+)\s*세\s*이상?/);
  if (m && m[1]) {
    const n = parseInt(m[1], 10);
    if (!isNaN(n)) return n;
  }

  // 기타 케이스는 해석 불가 → null (차단하지 않음)
  return null;
}

/** YYYY-MM-DD/YYYY.MM.DD/yyyymmdd 등에서 YYYY-MM-DD로 정규화 */
function normalizeBirthYmd(raw?: string | null): string | null {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!s) return null;

  // 8자리 숫자 → yyyymmdd
  if (/^\d{8}$/.test(s)) {
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  }
  // YYYY.MM.DD / YYYY/MM/DD / YYYY-MM-DD
  const cleaned = s.replace(/[./]/g, '-');
  const m = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;

  return null;
}

/** 기준일(onDate) 기준 만 나이 계산 */
function calcAgeOn(birthYmd: string, onDate: Date): number {
  const [by, bm, bd] = birthYmd.split('-').map((v) => parseInt(v, 10));
  if (!by || !bm || !bd) return NaN;
  const y = onDate.getFullYear();
  const m = onDate.getMonth() + 1;
  const d = onDate.getDate();

  let age = y - by;
  if (m < bm || (m === bm && d < bd)) age -= 1;
  return age;
}

/** 여러 스토어 키 후보에서 생년월일을 안전히 끌어오기 */
function getBirthYmdFromStore(store: any): string | null {
  const candidates = [
    store?.profile?.birthDate,
    store?.user?.birthDate,
    store?.user?.birth,
    store?.member?.birthDate,
    store?.birthDate,
    store?.birth, // 혹시나
  ];
  for (const c of candidates) {
    const norm = normalizeBirthYmd(c);
    if (norm) return norm;
  }
  return null;
}

const FestivalScheduleSection: React.FC = () => {
  const { fid } = useParams<{ fid: string }>();
  const { data: detail, isLoading, isError, status } = useFestivalDetail(fid ?? '');
  const { refetch: refetchAge } = useUserAgeQuery({ enabled: false });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const accessToken = useAuthStore((s) => s.accessToken);

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
    unique.sort(); // "HH:mm" 문자열 정렬 → 시간 오름차순
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
      const first = availableTimes[0];
      setSelectedTime(first);
    } else {
      setSelectedTime(null);
    }
  }, [selectedDate, availableTimes]);

  /** 최초 로딩 시: 오늘 기준 가장 빠른 선택 가능 날짜 + 그 날의 가장 빠른 시간 자동 선택 */
  useEffect(() => {
    if (!detail) return;
    if (selectedDate && selectedTime) return;

    // 1) 가장 빠른 선택 가능 날짜 찾기
    let initialDate: Date | null = null;
    if (isSingleDay && endDate) {
      initialDate = endDate;
    } else {
      if (endDate) {
        const startScan = new Date(effectiveMinDate ?? today);
        for (let i = 0; i < 730 && startScan <= endDate; i++) {
          if (isSelectableDate(startScan)) { initialDate = new Date(startScan); break; }
          startScan.setDate(startScan.getDate() + 1);
        }
      } else if (effectiveMinDate) {
        initialDate = effectiveMinDate;
      }
    }

    // 2) 시간 선택
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
                    type="button"
                    aria-pressed={selectedTime === time}
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
            <Button
              className={styles.confirmBtn}
              disabled={confirmDisabled}
              onClick={async () => {                    // ✅ async로 변경
                // 1) ✅ 로그인 가드
                if (!accessToken) {
                  alert('로그인이 필요한 서비스입니다.');
                  const redirect = location.pathname + location.search;
                  navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
                  return;
                }

                // 2) ✅ 관람연령 가드 (필요할 때만 서버 호출)
                const ageText =
                  (detail as any)?.prfage ??
                  (detail as any)?.age ??
                  (detail as any)?.ageLimit ??
                  null;

                const minAge = parseMinAge(ageText);
                if (minAge !== null && minAge > 0) {
                  try {
                    const { data: userAge } = await refetchAge(); // GET /api/users/checkAge
                    if (userAge == null) {
                      alert('나이 확인에 실패했어요. 잠시 후 다시 시도해 주세요.');
                      return;
                    }
                    if (userAge < minAge) {
                      alert('관람연령 이상만 예매 가능한 공연입니다.');
                      return;
                    }
                  } catch (e) {
                    console.error(e);
                    alert('나이 확인에 실패했어요. 잠시 후 다시 시도해 주세요.');
                    return;
                  }
                }

                // 3) ✅ 예매 팝업
                if (!selectedDate || !fid) return;
                const fdfrom = startDate ? ymd(startDate) : null;
                const fdto = endDate ? ymd(endDate) : null;
                openbookingPopup(fid, selectedDate, selectedTime, fdfrom, fdto);
              }}
            >
              예매하기
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default FestivalScheduleSection;
