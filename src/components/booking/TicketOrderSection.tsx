import React from 'react';
import DatePicker from 'react-datepicker';
// ✅ date-fns는 개별 로케일을 default import로 쓰는 게 안정적
import { ko } from 'date-fns/locale/ko';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import styles from './TicketOrderSection.module.css';

// ✅ 1차 API 훅 (reservationNumber 받는 용도)
import { useSelectDate } from '@/models/booking/tanstack-query/useBookingDetail';
import type { BookingSelect } from '@/models/booking/bookingTypes';

type NextPayload = {
  fid?: string;
  date: Date;
  time: string;
  quantity: number;
};

type Props = {
  fid?: string;

  selectedDate?: Date | null;
  selectedTime?: string | null;

  availableDates?: Array<Date | string> | null;
  timesByDate?: Record<string, string[]> | null;

  pricePerTicket?: number;
  maxQuantity?: number;
  initialQuantity?: number;

  /** 예매하기 클릭 시 상위에서 추가 로직 실행하고 싶을 때 사용 (선택) */
  onNext?: (payload: NextPayload) => void;

  /** 예매하기 클릭 시 이 컴포넌트가 직접 이동할 경로.
   *  문자열이거나, payload → 경로 생성 함수 둘 다 허용.
   *  예: to={(p) => `/booking/${p.fid}/order-info`}
   */
  to?: string | ((p: { fid?: string; dateYMD: string; time: string; quantity: number; reservationNumber: string }) => string);

  /** 제공된 날짜/시간/매수 정보가 비어있을 때 데모 데이터로 표시 */
  useDemoIfEmpty?: boolean;
  className?: string;
};

// ---------- utils ----------
const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const formatPrice = (n: number) =>
  new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(n);

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** 로컬 타임존 기준으로 HH:mm를 합쳐 "YYYY-MM-DDTHH:mm:ss" 문자열 생성 */
const toLocalISO = (date: Date, hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
};

function makeDemo() {
  const base = new Date();
  const d1 = new Date(base); d1.setDate(base.getDate() + 2);
  const d2 = new Date(base); d2.setDate(base.getDate() + 5);
  return {
    dates: [d1, d2],
    times: { [ymd(d1)]: ['14:00', '18:00'], [ymd(d2)]: ['16:00'] },
    price: 88000,
    maxQty: 4,
  };
}

const TicketOrderSection: React.FC<Props> = ({
  fid,
  selectedDate, selectedTime,
  availableDates = [], timesByDate = {},
  pricePerTicket, maxQuantity, initialQuantity = 1,
  onNext, to,
  useDemoIfEmpty = true, className = '',
}) => {
  const navigate = useNavigate();
  const selectDateMut = useSelectDate();          // ✅ 1차 API 훅
  const [submitting, setSubmitting] = React.useState(false); // ✅ 버튼 로딩 제어

  // ------ normalize incoming dates ------
  const normalizedDates = React.useMemo<Date[]>(
    () => (Array.isArray(availableDates) ? availableDates : [])
      .map(d => (d instanceof Date ? new Date(d) : new Date(String(d))))
      .filter(d => !isNaN(d.getTime())),
    [availableDates]
  );

  // ------ demo fallback ------
  const demo = useDemoIfEmpty && normalizedDates.length === 0 ? makeDemo() : null;
  const dates = demo ? demo.dates : normalizedDates;
  const tbd = demo ? demo.times : (timesByDate ?? {});
  const unitPrice = demo ? demo.price : (pricePerTicket ?? 88000);
  const maxQty = demo ? demo.maxQty : (maxQuantity ?? 4);
  const isSoldOut = maxQty <= 0;

  // ------ calendar range ------
  const sortedDates = React.useMemo(
    () => [...dates].sort((a, b) => a.getTime() - b.getTime()),
    [dates]
  );
  const minDate = sortedDates[0] ?? null;
  const maxDate = sortedDates[sortedDates.length - 1] ?? null;

  // ------ selection states ------
  const [date, setDate] = React.useState<Date | null>(selectedDate ?? minDate ?? null);

  const timesForDate = React.useMemo(() => {
    if (!date) return [];
    const arr = tbd[ymd(date)] ?? [];
    return Array.from(new Set(arr)).sort((a, b) => {
      const [ha, ma] = a.split(':').map(Number);
      const [hb, mb] = b.split(':').map(Number);
      return ha * 60 + ma - (hb * 60 + mb);
    });
  }, [date, tbd]);

  const [time, setTime] = React.useState<string | null>(selectedTime ?? (timesForDate[0] ?? null));
  React.useEffect(() => {
    if (!date) return setTime(null);
    if (timesForDate.length === 0) return setTime(null);
    if (!time || !timesForDate.includes(time)) setTime(timesForDate[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, timesForDate]);

  const [quantity, setQuantity] = React.useState(clamp(initialQuantity, 1, Math.max(1, maxQty)));
  const totalPrice = unitPrice * (isSoldOut ? 0 : quantity);
  const isReady = !!date && !!time && !isSoldOut;

  // ------ helpers ------
  const includeDate = (d: Date) => sortedDates.some(ad => ymd(ad) === ymd(d));

  // ✅ 핵심: 1차(selectDate) 호출 → reservationNumber 수신 → state에 싣고 이동
  const handleNext = async () => {
    if (!isReady || !date || !time) return;
    if (!fid) { console.warn('[order] fid 없음'); return; }

    // 상위에서 뭔가 하려면 먼저 호출
    onNext?.({ fid, date, time, quantity });

    try {
      setSubmitting(true);

      // 1차 바디
      const body: BookingSelect = {
        festivalId: fid,
        performanceDate: toLocalISO(date, time),
        selectedTicketCount: quantity,
      };

      // 서버 호출 (reservationNumber 수신)
      const reservationNumber = await selectDateMut.mutateAsync(body);

      // 이동 경로
      const defaultPath = `/booking/${fid}/order-info`;
      const dateYMD = ymd(date);
      const path = typeof to === 'function'
        ? to({ fid, dateYMD, time, quantity, reservationNumber })
        : (to || defaultPath);

      // 넘길 state (받는 쪽이 쓰는 키로 통일)
      const navState = {
        fid,
        dateYMD,
        time,
        quantity,
        reservationNumber,              // ✅ 2차 상세 조회용
        // 호환/백엔드 DTO용도 같이 실어줌
        performanceDate: body.performanceDate,
        selectedTicketCount: quantity,
      };

      console.log('[order] selectDate OK →', { reservationNumber, body });
      console.log('[order] navigate payload →', navState, 'path=', path);

      // 새로고침 대비(선택): URL 쿼리도 같이 쓰고 싶으면 아래로 교체
      // navigate(`${path}?resNo=${reservationNumber}&date=${dateYMD}&time=${time}&qty=${quantity}`, { state: navState });

      navigate(path, { state: navState });
    } catch (e) {
      console.error('[order] selectDate 실패', e);
      alert('예매 선택 처리에 실패했어요. 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className={`${styles.section} ${className || ''}`} aria-label="예매 선택 패널">
      <h2 className={styles.header}>예매 정보</h2>

      <div className={styles.content}>
        <div className={styles.topGrid}>
          <div>
            <DatePicker
              selected={date}
              onChange={(d) => setDate(d)}
              locale={ko}
              inline
              filterDate={includeDate}
              includeDates={sortedDates}
              minDate={minDate ?? undefined}
              maxDate={maxDate ?? undefined}
              showDisabledMonthNavigation
            />
          </div>

          <div>
            <div className={styles.subTitle}>시간</div>
            {timesForDate.length === 0 ? (
              <div style={{ color: '#9ca3af', fontSize: 14 }}>선택 가능한 시간이 없습니다</div>
            ) : (
              <div className={styles.timeList}>
                {timesForDate.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTime(t)}
                    className={`${styles.timeBtn} ${time === t ? styles.timeBtnActive : ''}`}
                    aria-pressed={time === t}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.label}>매수 선택</div>
          <div>
            <div className={styles.qtyBox}>
              <button
                type="button"
                onClick={() => setQuantity((q) => clamp(q - 1, 1, maxQty))}
                disabled={quantity <= 1 || isSoldOut || submitting}
                className={styles.qtyBtn}
                aria-label="매수 감소"
              >
                −
              </button>
              <span className={styles.qtyVal}>{isSoldOut ? 0 : quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => clamp(q + 1, 1, maxQty))}
                disabled={quantity >= maxQty || isSoldOut || submitting}
                className={styles.qtyBtn}
                aria-label="매수 증가"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.label}>가격</div>
          <div>{formatPrice(unitPrice)}원 / 1매</div>
        </div>

        <div className={styles.limit}>{isSoldOut ? '매진' : `제한 ${maxQty}개`}</div>
      </div>

      <div className={styles.bottomDock}>
        <div className={styles.totalBar}>
          <span>총 가격</span>
          <strong>{formatPrice(totalPrice)}원</strong>
        </div>

        <Button
          type="button"
          disabled={!isReady || submitting}
          className={styles.nextButton}
          onClick={handleNext}
        >
          {submitting ? '처리중…' : '예매하기'}
        </Button>
      </div>
    </aside>
  );
};

export default TicketOrderSection;