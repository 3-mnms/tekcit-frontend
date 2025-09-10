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
import { useEnterWaitingMutation } from '@/models/waiting/tanstack-query/useWaiting';

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

/* =========================
   ✅ 팝업 사이즈 상수
   ========================= */
const WAIT_W = 480;
const WAIT_H = 720;
const BOOK_W = 1000;
const BOOK_H = 600;

/* =========================
   ✅ 연령 체크 유틸들 (파일 내부 전용)
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

/** HH:mm → Date에 시분 합치기 (파일 내부 전용) */
const __fs_combineDateTime = (day: Date, hhmm?: string | null): Date => {
  const d = new Date(day);
  d.setSeconds(0, 0);
  if (!hhmm || hhmm === '공연시작') {
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return d;
  const h = Math.min(23, parseInt(m[1], 10) || 0);
  const mm = Math.min(59, parseInt(m[2], 10) || 0);
  d.setHours(h, mm, 0, 0);
  return d;
};

/** 중앙 팝업 오픈 (파일 내부 전용) */
const __fs_openCenteredPopup = (url: string, w: number, h: number, name: string = 'tekcit-popup') => {
  const availLeft = (screen as any).availLeft ?? 0;
  const availTop  = (screen as any).availTop  ?? 0;
  const availW    = screen.availWidth ?? screen.width;
  const availH    = screen.availHeight ?? screen.height;

  const left = Math.max(availLeft, Math.round(availLeft + (availW - w) / 2));
  const top  = Math.max(availTop,  Math.round(availTop  + (availH - h) / 2));

  const feat = [
    'popup=yes','noopener','noreferrer',
    'toolbar=0','menubar=0','location=0','status=0',
    'scrollbars=1','resizable=1',
    `width=${w}`, `height=${h}`, `left=${left}`, `top=${top}`,
  ].join(',');

  window.open(url, name, feat);  // ← _blank 대신 고정 name
};

/** 예매 팝업 (파일 내부 전용) */
const __fs_openBookingPopup = (
  fid: string | number,
  date: Date,
  time?: string | null,
  fdfrom?: string | null,
  fdto?: string | null
) => {
  const params = new URLSearchParams();
  params.set('date', ymd(date));
  if (time) params.set('time', time);
  if (fdfrom) params.set('fdfrom', fdfrom);
  if (fdto) params.set('fdto', fdto);
  params.set('nochat', '1'); 
  __fs_openCenteredPopup(`/booking/${fid}?${params.toString()}`, BOOK_W, BOOK_H); // 1000×600
};

/** 대기열 팝업 (파일 내부 전용, enter는 이미 호출됨. skipEnter=1로 중복 방지) */
const __fs_openWaitingPopup = (
  fid: string | number,
  date: Date,
  time: string | null,
  waitingNumber: number,
  fdfrom?: string | null,
  fdto?: string | null
) => {
  const params = new URLSearchParams();
  params.set('date', ymd(date));
  if (time) params.set('time', time);
  params.set('wn', String(waitingNumber));
  params.set('skipEnter', '1');
  if (fdfrom) params.set('fdfrom', fdfrom);
  if (fdto) params.set('fdto', fdto);
  params.set('nochat', '1'); 
  __fs_openCenteredPopup(`/booking/${fid}/queue?${params.toString()}`, WAIT_W, WAIT_H); // 480×720
};

const FestivalScheduleSection: React.FC = () => {
  const { fid } = useParams<{ fid: string }>();
  const { data: detail, isLoading, isError, status } = useFestivalDetail(fid ?? '');
  const { refetch: refetchAge } = useUserAgeQuery({ enabled: false });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const accessToken = useAuthStore((s) => s.accessToken);
  const enterMut = useEnterWaitingMutation();

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
              onClick={async () => {
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

                // 가상 대기열 추가 테스트 끝나면 삭제
                const FORCE_WAIT = false; // 테스트 끝나면 false
                if (FORCE_WAIT && selectedDate && fid) {
                  const fdfrom = startDate ? ymd(startDate) : null;
                  const fdto = endDate ? ymd(endDate) : null;
                  __fs_openWaitingPopup(
                    fid,
                    selectedDate,
                    selectedTime,
                    1, // 내 앞 대기자 수 (더미)
                    fdfrom,
                    fdto
                  );
                  return; // 바로 리턴해서 실제 API 호출 안 함
                }

                // 3) ✅ 대기열 확인 → 분기
                if (!selectedDate || !fid) return;
                const fdfrom = startDate ? ymd(startDate) : null;
                const fdto = endDate ? ymd(endDate) : null;

                const reservationDateTime = __fs_combineDateTime(selectedDate, selectedTime);

                try {
                  const res = await enterMut.mutateAsync({
                    festivalId: fid,
                    reservationDate: reservationDateTime,
                  });

                  if (res.immediateEntry) {
                    // 바로 예매 팝업 (1000×600)
                    __fs_openBookingPopup(fid, selectedDate, selectedTime, fdfrom, fdto);
                  } else {
                    // 대기열 팝업 (480×720)
                    __fs_openWaitingPopup(
                      fid,
                      selectedDate,
                      selectedTime,
                      res.waitingNumber,
                      fdfrom,
                      fdto,
                    );
                  }
                } catch (err) {
                  console.error('[enter waiting] error:', err);
                  // 실패 시엔 직접 예매 팝업을 열지 말고 사용자에게 재시도 유도
                  alert(' 진입에 실패했어요. 잠시 후 다시 시도해 주세요.');
                }
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
