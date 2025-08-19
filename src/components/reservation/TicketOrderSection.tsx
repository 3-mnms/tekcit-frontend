import React from 'react';
import DatePicker from 'react-datepicker';
import ko from 'date-fns/locale/ko';
import 'react-datepicker/dist/react-datepicker.css';
import Button from '@/components/common/Button';
import styles from './TicketOrderSection.module.css';

type Props = {
  selectedDate?: Date | null;
  selectedTime?: string | null;

  /** API 미연결 대비: 없어도 됨 */
  availableDates?: Array<Date | string> | null;
  timesByDate?: Record<string, string[]> | null;

  /** 없어도 됨(데모 기본값 사용) */
  pricePerTicket?: number;
  maxQuantity?: number;
  initialQuantity?: number;

  onNext?: (payload: {
    date: Date;
    time: string;
    quantity: number;
    totalPrice: number;
  }) => void;

  /** 개발 중엔 true 유지 → 데이터 없으면 데모로 자동 대체 */
  useDemoIfEmpty?: boolean;
  className?: string;
};

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const formatPrice = (n: number) =>
  new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(n);
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const timeToMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
};
const isValidDate = (d: Date) => !isNaN(d.getTime());

/** 데모 데이터 생성 */
function makeDemo() {
  const base = new Date();
  const d1 = new Date(base); d1.setDate(base.getDate() + 3);
  const d2 = new Date(base); d2.setDate(base.getDate() + 5);
  const dates = [d1, d2];
  const times: Record<string, string[]> = {
    [ymd(d1)]: ['14:00', '18:00'],
    [ymd(d2)]: ['16:00'],
  };
  return { dates, times, price: 88000, maxQty: 4 };
}

const TicketOrderSection: React.FC<Props> = ({
  selectedDate,
  selectedTime,
  availableDates = [],
  timesByDate = {},
  pricePerTicket,
  maxQuantity,
  initialQuantity = 1,
  onNext,
  useDemoIfEmpty = true,
  className = '',
}) => {
  /** 0) 데모 폴백 결정 */
  const normalizedDates = React.useMemo<Date[]>(() => {
    const arr = Array.isArray(availableDates) ? availableDates : [];
    return arr
      .map((d) => (d instanceof Date ? new Date(d) : new Date(String(d))))
      .filter(isValidDate);
  }, [availableDates]);

  const shouldUseDemo = useDemoIfEmpty && normalizedDates.length === 0;
  const demo = React.useMemo(() => (shouldUseDemo ? makeDemo() : null), [shouldUseDemo]);

  const dates = shouldUseDemo ? demo!.dates : normalizedDates;
  const tbd = shouldUseDemo ? demo!.times : (timesByDate ?? {});
  const unitPrice = shouldUseDemo ? demo!.price : (pricePerTicket ?? 0);
  const maxQty = shouldUseDemo ? demo!.maxQty : (maxQuantity ?? 0);

  if (shouldUseDemo) {
    console.warn('[TicketOrderSection] API 데이터 없음 → DEMO 모드로 렌더링합니다.');
  }

  /** 1) 날짜/시간 준비 */
  const sortedDates = React.useMemo(
    () => [...dates].sort((a, b) => a.getTime() - b.getTime()),
    [dates]
  );
  const minDate = sortedDates[0] ?? null;
  const maxDate = sortedDates[sortedDates.length - 1] ?? null;

  const [date, setDate] = React.useState<Date | null>(selectedDate ?? minDate ?? null);

  const rawTimesForDate = React.useMemo(() => {
    if (!date) return [];
    return (tbd?.[ymd(date)] ?? []);
  }, [date, tbd]);

  const timesForDate = React.useMemo(
    () => Array.from(new Set(rawTimesForDate)).sort((a, b) => timeToMinutes(a) - timeToMinutes(b)),
    [rawTimesForDate]
  );

  const [time, setTime] = React.useState<string | null>(
    selectedTime ?? (timesForDate[0] ?? null)
  );

  React.useEffect(() => {
    if (!date) return setTime(null);
    if (timesForDate.length === 0) return setTime(null);
    if (!time || !timesForDate.includes(time)) setTime(timesForDate[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, timesForDate]);

  /** 2) 매수/합계 */
  const [quantity, setQuantity] = React.useState(
    clamp(initialQuantity, 1, Math.max(1, maxQty))
  );
  const dec = () => setQuantity((q) => clamp(q - 1, 1, maxQty));
  const inc = () => setQuantity((q) => clamp(q + 1, 1, maxQty));

  const totalPrice = React.useMemo(() => unitPrice * quantity, [unitPrice, quantity]);
  const isSoldOut = maxQty <= 0;
  const isReady = !!date && !!time && !isSoldOut;

  const handleNext = () => {
    if (!isReady || !date || !time) return;
    if (onNext) {
      onNext({ date, time, quantity, totalPrice });
    } else {
      // 개발 편의: onNext 없을 때도 알림으로 확인
      alert(
        `[DEMO] 다음 단계\n날짜: ${ymd(date)}\n시간: ${time}\n매수: ${quantity}\n총액: ${totalPrice.toLocaleString()}원`
      );
    }
  };

  /** 3) 달력 제한 */
  const includeDate = (d: Date) => {
    const key = ymd(d);
    return sortedDates.some((ad) => ymd(ad) === key);
  };

  return (
    <aside className={styles.section} aria-label="예매 선택 패널">
      <div className={styles.content}>
        <h2 className={styles.header}>예매 정보</h2>

        {/* 달력 */}
        <div className="mb-4">
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

        {/* 시간, 가격, 매수 UI (그대로 유지) */}
        {/* ... */}
      </div>

      {/* footer */}
      <div className={styles.footer}>
        <Button
          type="button"
          onClick={handleNext}
          disabled={!isReady}
          className={styles.nextButton}
        >
          다음
        </Button>
      </div>
    </aside>
  );
}

export default TicketOrderSection;
