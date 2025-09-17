// src/pages/booking/TicketOrderPage.tsx
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styles from './TicketOrderPage.module.css';
import TicketOrderSection from '@/components/booking/TicketOrderSection';

import { useSelectDate, usePhase1Detail } from '@/models/booking/tanstack-query/useBookingDetail';
import type { BookingSelect } from '@/models/booking/bookingTypes';
import { useAuthStore } from '@/shared/storage/useAuthStore';
import CaptchaOverlay from '@/components/booking/captcha/CaptchaOverlay';
import Spinner from '@/components/common/spinner/Spinner'
import { useReleaseWaitingMutation } from '@/models/waiting/tanstack-query/useWaiting'

// -------------------- utils --------------------
const pad2 = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const hhmm = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

const toLocalIsoString = (date: Date, timeHHmm: string) => {
  const [hh, mm] = timeHHmm.split(':').map(Number);
  const dt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hh, mm, 0, 0);
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}T${pad2(dt.getHours())}:${pad2(dt.getMinutes())}:00`;
};

const DOW: Array<'SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT'> =
  ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const parseYMD = (s: string) => {
  if (!s) return null;
  const d = s.includes('T') ? new Date(s) : new Date(`${s}T00:00:00`);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const inRange = (d: Date, from: Date, to: Date) =>
  d.getTime() >= from.getTime() && d.getTime() <= to.getTime();

// -------------------- calendar builders --------------------
function buildCalendarData(detail: any, fdfrom?: string, fdto?: string) {
  const byDate: Record<string, Set<string>> = {};
  const list = Array.isArray(detail?.schedules) ? detail.schedules : [];

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

  if (!fromDate || !toDate) {
    const base = new Date(); base.setHours(0, 0, 0, 0);
    fromDate ||= base;
    toDate ||= new Date(base.getFullYear(), base.getMonth(), base.getDate() + 90);
  }

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
    const weekdaySet = new Set<string>();
    const timeByWeekday = new Map<string, Set<string>>();

    list.forEach((s: any) => {
      const dow = String(s?.dayOfWeek || '').toUpperCase();
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
  // ✅ 모든 훅은 무조건 호출 (조기 return 금지)
  const accessToken = useAuthStore((s) => s.accessToken); // 유지
  const navigate = useNavigate();
  const { fid: fidParam } = useParams<{ fid: string }>();
  const { state } = useLocation() as {
    state?: { fid?: string; dateYMD?: string; time?: string; quantity?: number };
  };
  const [sp] = useSearchParams();

  const [captchaPassed, setCaptchaPassed] = useState(false);

  const fid = state?.fid || fidParam || sp.get('fid') || '';
  const initialDateYMD = state?.dateYMD || sp.get('date') || '';
  const initialTime = state?.time || sp.get('time') || '';
  const initialQty = Number(state?.quantity || sp.get('qty') || 1);

  const [selDate, setSelDate] = useState<Date | null>(initialDateYMD ? new Date(initialDateYMD) : null);
  const [selTime, setSelTime] = useState<string | null>(initialTime || null);
  const [selQty, setSelQty] = useState<number>(Number.isFinite(initialQty) ? initialQty : 1);
  const releaseMut = useReleaseWaitingMutation();

  const phase1Req: BookingSelect | null = useMemo(() => {
    if (!fid || !selDate || !selTime) return null;
    const payload = {
      festivalId: fid,
      performanceDate: toLocalIsoString(selDate, selTime),
      selectedTicketCount: 0,
    };
    return payload;
  }, [fid, selDate, selTime]);

  const { data: phase1, isLoading, isError, isFetching } = usePhase1Detail(
    phase1Req ?? ({} as any)
  );

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

    const fdFromStr = sp.get('fdfrom') ?? undefined;
    const fdToStr = sp.get('fdto') ?? undefined;

    const cal = buildCalendarData(phase1, fdFromStr, fdToStr);

    let sDate: Date | null = null;
    let sTime: string | null = null;

    if (typeof phase1?.performanceDate === 'string') {
      const dt = new Date(phase1.performanceDate);
      if (!isNaN(dt.getTime())) {
        const day = parseYMD(ymd(dt))!;
        const time = hhmm(dt);
        if (!cal.fromDate || !cal.toDate || inRange(day, cal.fromDate, cal.toDate)) {
          sDate = day;
          sTime = time;
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
      serverSelectedDate: sDate,
      serverSelectedTime: sTime,
    };
  }, [phase1, sp]);

  useEffect(() => {
    if (!selDate && serverSelectedDate) setSelDate(serverSelectedDate);
    if (!selTime && serverSelectedTime) setSelTime(serverSelectedTime);
  }, [selDate, selTime, serverSelectedDate, serverSelectedTime]);

  const selMut = useSelectDate(); // ✅ 훅 순서 고정

  // 스크롤 락도 항상 호출되도록
  useEffect(() => {
    if (!captchaPassed) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [captchaPassed]);

  const clickLockRef = React.useRef(false);

  const handleNext = useCallback(
    async ({ date, time, quantity }: { date: Date; time: string; quantity: number }) => {
      if (!fid) return;
      if (clickLockRef.current) return;
      clickLockRef.current = true;

      const payload: BookingSelect = {
        festivalId: fid,
        performanceDate: toLocalIsoString(date, time),
        selectedTicketCount: quantity,
      };

      try {
        const res = await selMut.mutateAsync(payload);
        const reservationNumber = typeof res === 'string' ? res : (res?.data ?? res);
        try { sessionStorage.setItem('reservationId', reservationNumber); } catch { }
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
        console.log('예약 오류', e);
        alert('예매 가능한 최대 매수를 초과하였습니다.');
      } finally {
        clickLockRef.current = false;
      }
    },
    [fid, navigate, selMut]
  );

  const selectedDateTime: Date | null = useMemo(() => {
    const d = selDate ?? serverSelectedDate ?? null;
    const t = selTime ?? serverSelectedTime ?? null;
    if (!d || !t) return null;
    const [hh, mm] = t.split(':').map(Number);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh, mm, 0, 0);
  }, [selDate, serverSelectedDate, selTime, serverSelectedTime]);

  useEffect(() => {
    if (!fid || !selectedDateTime) return;

    const firedRef = { current: false }; // 여러 이벤트 중복 방지

    const fireOnce = () => {
      if (firedRef.current) return;
      firedRef.current = true;

      // 1) BE에 대기열 해제 요청 (useMutation)
      try {
        releaseMut.mutate({
          festivalId: String(fid),
          reservationDate: selectedDateTime,
        });
      } catch { /* */ }
    };

    const onPageHide = () => fireOnce();
    const onBeforeUnload = () => fireOnce();
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') fireOnce();
    };

    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      fireOnce();
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [fid, selectedDateTime, accessToken, releaseMut]);

  // ====== 렌더링 분기(훅 다음에서만) ======
  const guardMessage = !fid
    ? 'fid가 필요합니다.'
    : (isError ? '예매 정보를 불러오지 못했어요.' : '');

  const readyForUI = availableDates.length > 0 && Object.keys(timesByDate).length > 0;

  return (
    <div className={styles.page}>
      {/* 가드 메시지 */}
      {guardMessage && <div className={styles.page}>{guardMessage}</div>}

      {/* 로딩(phase1 없고 로딩 중) */}
      {!guardMessage && isLoading && !phase1 && (
        <Spinner />
      )}

      {/* 정상 UI */}
      {!guardMessage && !(isLoading && !phase1) && (
        <>
          <section className={styles.leftWrap} aria-hidden={!captchaPassed}>
            <img
              className={styles.poster}
              src={poster || 'https://picsum.photos/1400/1600'}
              alt={title || '공연 포스터'}
            />
            <div className={styles.leftTitleBar}>{title || '페스티벌'}</div>
          </section>

          <div className={styles.right} aria-hidden={!captchaPassed}>
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

            {isFetching && (
              <Spinner />
            )}
          </div>

          {/* 캡챠 오버레이 */}
          {!captchaPassed && (
            <CaptchaOverlay
              onVerified={() => setCaptchaPassed(true)}
              onCloseWindow={() => window.close()}
              expireSeconds={180}
            />
          )}
        </>
      )}
    </div>
  );
};

export default TicketOrderPage;
