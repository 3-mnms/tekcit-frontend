// src/pages/booking/TicketOrderPage.tsx
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styles from './TicketOrderPage.module.css';
import TicketOrderSection from '@/components/booking/TicketOrderSection';

import { useSelectDate, usePhase1Detail } from '@/models/booking/tanstack-query/useBookingDetail';
import type { BookingSelect } from '@/models/booking/bookingTypes';
import { useAuthStore } from '@/shared/storage/useAuthStore' 

// -------------------- utils --------------------
const pad2 = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const hhmm = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

// 로컬시간 기준 ISO(초까지만)
const toLocalIsoString = (date: Date, timeHHmm: string) => {
  const [hh, mm] = timeHHmm.split(':').map(Number);
  const dt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hh, mm, 0, 0);
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}T${pad2(dt.getHours())}:${pad2(dt.getMinutes())}:00`;
};

// 콘솔에 바로 붙여넣는 cURL
const toCurl = (url: string, body: any) => {
  const json = JSON.stringify(body).replace(/'/g, `'\\''`);
  return `curl -i -X POST '${url}' -H 'Content-Type: application/json' -d '${json}'`;
};

// 요일코드 표준화
const DOW: Array<'SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT'> =
  ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// "YYYY-MM-DD" 또는 ISO 문자열 → 자정 Date
const parseYMD = (s: string) => {
  if (!s) return null;
  const d = s.includes('T') ? new Date(s) : new Date(`${s}T00:00:00`);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const inRange = (d: Date, from: Date, to: Date) =>
  d.getTime() >= from.getTime() && d.getTime() <= to.getTime();

// -------------------- calendar builders --------------------
/**
 * Phase1 응답(detail)을 받아서
 * - 명시적 일정(startDateTime 또는 date+time)이 있으면 범위 내만 반영
 * - 없고 {dayOfWeek, time}만 있으면 fdfrom~fdto 사이에서 해당 요일들만 생성
 * fdfrom/fdto는 쿼리/응답의 값을 우선 사용(외부 인자 > 응답 속성)
 */
function buildCalendarData(detail: any, fdfrom?: string, fdto?: string) {
  const byDate: Record<string, Set<string>> = {};
  const list = Array.isArray(detail?.schedules) ? detail.schedules : [];

  // 1) 기간 결정
  let fromDate: Date | null =
    parseYMD(detail?.fdfrom) ||
    parseYMD(detail?.period?.from) ||
    null;

  let toDate: Date | null =
    parseYMD(detail?.fdto) ||
    parseYMD(detail?.period?.to) ||
    null;

  if (fdfrom) fromDate = parseYMD(fdfrom) || fromDate;
  if (fdto) toDate = parseYMD(fdto) || toDate;

  // 둘 중 하나라도 없으면 안전한 fallback (오늘~+90일)
  if (!fromDate || !toDate) {
    const base = new Date(); base.setHours(0, 0, 0, 0);
    fromDate ||= base;
    toDate ||= new Date(base.getFullYear(), base.getMonth(), base.getDate() + 90);
  }

  // 2) 명시적 일정(우선)
  const explicit = list.filter(
    (s: any) => typeof s?.startDateTime === 'string' || (typeof s?.date === 'string' && typeof s?.time === 'string')
  );

  if (explicit.length > 0) {
    explicit.forEach((s: any) => {
      let dt: Date | null = null;
      if (typeof s?.startDateTime === 'string') dt = new Date(s.startDateTime);
      else if (typeof s?.date === 'string' && typeof s?.time === 'string') dt = new Date(`${s.date}T${s.time}:00`);
      if (!dt || isNaN(dt.getTime())) return;

      const day = parseYMD(ymd(dt))!;
      if (!inRange(day, fromDate!, toDate!)) return;

      const k = ymd(day);
      (byDate[k] ||= new Set()).add(hhmm(dt));
    });
  } else {
    // 3) 요일+시간 기반: fdfrom~fdto 사이에서만 생성
    const weekdaySet = new Set<string>();
    const timeByWeekday = new Map<string, Set<string>>();

    list.forEach((s: any) => {
      const dow = String(s?.dayOfWeek || '').toUpperCase(); // 'MON'..'SUN'
      const time = typeof s?.time === 'string' ? s.time.slice(0, 5) : '';
      if (!dow || !time) return;
      weekdaySet.add(dow);
      (timeByWeekday.get(dow) || timeByWeekday.set(dow, new Set()).get(dow)!).add(time);
    });

    const cur = new Date(fromDate!);
    while (cur.getTime() <= toDate!.getTime()) {
      const d = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate());
      const dow = DOW[d.getDay()];
      const times = Array.from(timeByWeekday.get(dow) ?? []);
      if (weekdaySet.has(dow) && times.length) {
        const key = ymd(d);
        (byDate[key] ||= new Set());
        times.forEach(t => byDate[key].add(t));
      }
      cur.setDate(cur.getDate() + 1);
    }
  }

  // 4) 정렬 결과
  const availableDates = Object.keys(byDate).sort().map(k => new Date(k));
  const timesByDate = Object.fromEntries(
    Object.entries(byDate).map(([k, set]) => [k, Array.from(set).sort((a, b) => {
      const [ha, ma] = a.split(':').map(Number);
      const [hb, mb] = b.split(':').map(Number);
      return ha * 60 + ma - (hb * 60 + mb);
    })])
  );

  return { availableDates, timesByDate, fromDate, toDate };
}

// -------------------- page --------------------
const TicketOrderPage: React.FC = () => {
  const accessToken = useAuthStore((s) => s.accessToken) // ⚠️ 요청대로 그대로 유지!
  const navigate = useNavigate();
  const { fid: fidParam } = useParams<{ fid: string }>();
  const { state } = useLocation() as {
    state?: { fid?: string; dateYMD?: string; time?: string; quantity?: number };
  };
  const [sp] = useSearchParams();

  // 1) 전달받은 선택값(우선순위: state > query > param)
  const fid = state?.fid || fidParam || sp.get('fid') || '';
  const initialDateYMD = state?.dateYMD || sp.get('date') || '';  // "YYYY-MM-DD"
  const initialTime = state?.time || sp.get('time') || '';        // "HH:mm"
  const initialQty = Number(state?.quantity || sp.get('qty') || 1);

  // 2) 페이지 상태(전달값 없으면 비워둠 → 서버 응답으로 초기화)
  const [selDate, setSelDate] = useState<Date | null>(initialDateYMD ? new Date(initialDateYMD) : null);
  const [selTime, setSelTime] = useState<string | null>(initialTime || null);
  const [selQty, setSelQty] = useState<number>(Number.isFinite(initialQty) ? initialQty : 1);

  // 3) Phase1 요청: 선택값이 있는 경우에만 호출
  const phase1Req: BookingSelect | null = useMemo(() => {
    if (!fid || !selDate || !selTime) return null;
    const payload = {
      festivalId: fid,
      performanceDate: toLocalIsoString(selDate, selTime),
      selectedTicketCount: 0,
    };
    // 디버깅용
    console.log('[PHASE1 payload → /api/booking/detail/phases/1]');
    console.log(payload);
    console.log('[cURL]', toCurl('/api/booking/detail/phases/1', payload));
    return payload;
  }, [fid, selDate, selTime]);

  const { data: phase1, isLoading, isError, isFetching } = usePhase1Detail(
    phase1Req ?? ({} as any) // 내부 enabled 조건에 의존
  );

  // 4) 서버 응답 → 달력/시간/가격 등 파생
  const {
    availableDates,
    timesByDate,
    pricePerTicket,
    maxQuantity,
    title,
    poster,
    serverSelectedDate,
    serverSelectedTime,
  } = useMemo(() => {
    if (!phase1) {
      return {
        availableDates: [] as Date[],
        timesByDate: {} as Record<string, string[]>,
        pricePerTicket: 0,
        maxQuantity: 0,
        title: '',
        poster: '',
        serverSelectedDate: null as Date | null,
        serverSelectedTime: null as string | null,
      };
    }

    // fdfrom/fdto: 쿼리파라미터 > 응답 내부 값(있을 경우)
    const fdFromStr = (sp.get('fdfrom') || phase1?.fdfrom || phase1?.period?.from) ?? undefined;
    const fdToStr   = (sp.get('fdto')   || phase1?.fdto   || phase1?.period?.to)   ?? undefined;

    const cal = buildCalendarData(phase1, fdFromStr, fdToStr);

    // 서버 성능일로 초기 선택 후보(단, 기간 밖이면 제외)
    let serverSelectedDate: Date | null = null;
    let serverSelectedTime: string | null = null;

    if (typeof phase1?.performanceDate === 'string') {
      const dt = new Date(phase1.performanceDate);
      if (!isNaN(dt.getTime())) {
        const day = parseYMD(ymd(dt))!;
        const time = hhmm(dt);
        if (!cal.fromDate || !cal.toDate || inRange(day, cal.fromDate, cal.toDate)) {
          serverSelectedDate = day;
          serverSelectedTime = time;
        }
      }
    }

    return {
      availableDates: cal.availableDates,
      timesByDate: cal.timesByDate,
      pricePerTicket: Number(phase1?.ticketPrice ?? 0),
      maxQuantity: Number(phase1?.maxPurchase ?? 0),
      title: String(phase1?.fname ?? ''),
      poster: String(phase1?.posterFile ?? ''),
      serverSelectedDate,
      serverSelectedTime,
    };
  }, [phase1, sp]);

  // 5) 초기 선택 자동 세팅(사용자 전달값 없고, 서버 초기값이 있을 때만)
  useEffect(() => {
    if (!selDate && serverSelectedDate) setSelDate(serverSelectedDate);
    if (!selTime && serverSelectedTime) setSelTime(serverSelectedTime);
  }, [selDate, selTime, serverSelectedDate, serverSelectedTime]);

  // 6) “다음” → selectDate로 예약번호 발급 (부모에서만 호출)
  const selMut = useSelectDate();

  // ✅ 더블클릭/중복 호출 방지 락
  const clickLockRef = React.useRef(false);

  const handleNext = useCallback(
    async ({ date, time, quantity }: { date: Date; time: string; quantity: number }) => {
      if (!fid) return;
      if (clickLockRef.current) return;   // 즉시 가드
      clickLockRef.current = true;

      const payload: BookingSelect = {
        festivalId: fid,
        performanceDate: toLocalIsoString(date, time),
        selectedTicketCount: quantity,
      };

      console.log('[PHASE2 payload → /api/booking/selectDate]');
      console.log(payload);
      console.log('[cURL]', toCurl('/api/booking/selectDate', payload));

      try {
        const res = await selMut.mutateAsync(payload);
        // res가 문자열(예약번호) 또는 {data: 예약번호}인 케이스 모두 호환
        const reservationNumber = typeof res === 'string' ? res : (res?.data ?? res);

        // 세션 보강 (새로고침 대비)
        try { sessionStorage.setItem('reservationId', reservationNumber); } catch {}

        // 네비게이션 (기존 파라미터 키 유지: res)
        navigate(`/booking/${fid}/order-info?res=${encodeURIComponent(reservationNumber)}`, {
          replace: true,
          state: {
            fid,
            dateYMD: ymd(date),
            time,
            quantity,
            reservationNumber,
            performanceDate: payload.performanceDate,
            selectedTicketCount: quantity,
          },
        });
      } catch (e) {
        console.log("예약 오류", e);
        alert('예약번호 발급에 실패했어요. 잠시 후 다시 시도해주세요.');
      } finally {
        clickLockRef.current = false;     // 완료 후 해제
      }
    },
    [fid, navigate, selMut]
  );

  // 7) 가드/로딩/오류
  if (!fid) return <div className={styles.page}>fid가 필요합니다.</div>;
  if (isLoading && !phase1) return <div className={styles.page}>불러오는 중…</div>;
  if (isError) return <div className={styles.page}>예매 정보를 불러오지 못했어요.</div>;

  // UI 렌더 준비
  const readyForUI = availableDates.length > 0 && Object.keys(timesByDate).length > 0;

  return (
    <div className={styles.page}>
      {/* 좌측: 포스터/제목 */}
      <section className={styles.leftWrap}>
        <img
          className={styles.poster}
          src={poster || 'https://picsum.photos/1400/1600'}
          alt={title || '공연 포스터'}
        />
        <div className={styles.leftTitleBar}>{title || '페스티벌'}</div>
      </section>

      {/* 우측: 예매 선택 */}
      <div className={styles.right}>
        {readyForUI ? (
          <TicketOrderSection
            fid={fid}
            useDemoIfEmpty={false}
            availableDates={availableDates}
            timesByDate={timesByDate}
            pricePerTicket={pricePerTicket}
            maxQuantity={maxQuantity}
            selectedDate={selDate ?? serverSelectedDate ?? null}
            selectedTime={selTime ?? serverSelectedTime ?? null}
            onSelectionChange={(d, t, q) => {
              setSelDate(d);
              setSelTime(t);
              setSelQty(q);
            }}
            onNext={handleNext}
          />
        ) : (
          <div>선택 가능한 일정 정보가 없습니다.</div>
        )}

        {isFetching && <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>정보 갱신 중…</div>}
      </div>
    </div>
  );
};

export default TicketOrderPage;
