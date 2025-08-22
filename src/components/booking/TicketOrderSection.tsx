import React from 'react';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import Button from '@/components/common/Button';
import styles from './TicketOrderSection.module.css';

type Props = {
  fid?: string;

  selectedDate?: Date | null;
  selectedTime?: string | null;

  availableDates?: Array<Date | string> | null;
  timesByDate?: Record<string, string[]> | null;

  pricePerTicket?: number;
  maxQuantity?: number;
  initialQuantity?: number;

  onNext?: (payload: {
    fid?: string;
    date: Date;
    time: string;
    quantity: number;
  }) => void;

  useDemoIfEmpty?: boolean;
  className?: string;
};

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const formatPrice = (n: number) =>
  new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(n);

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

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
  onNext, useDemoIfEmpty = true, className = '',
}) => {
  const normalizedDates = React.useMemo<Date[]>(
    () => (Array.isArray(availableDates) ? availableDates : [])
      .map(d => (d instanceof Date ? new Date(d) : new Date(String(d))))
      .filter(d => !isNaN(d.getTime())),
    [availableDates]
  );

  const demo = useDemoIfEmpty && normalizedDates.length === 0 ? makeDemo() : null;
  const dates = demo ? demo.dates : normalizedDates;
  const tbd = demo ? demo.times : (timesByDate ?? {});
  const unitPrice = demo ? demo.price : (pricePerTicket ?? 88000);
  const maxQty = demo ? demo.maxQty : (maxQuantity ?? 4);
  const isSoldOut = maxQty <= 0;

  const sortedDates = React.useMemo(() => [...dates].sort((a, b) => a.getTime() - b.getTime()), [dates]);
  const minDate = sortedDates[0] ?? null;
  const maxDate = sortedDates[sortedDates.length - 1] ?? null;

  const [date, setDate] = React.useState<Date | null>(selectedDate ?? minDate ?? null);
  const timesForDate = React.useMemo(() => {
    if (!date) return [];
    const arr = tbd[ymd(date)] ?? [];
    return Array.from(new Set(arr)).sort((a, b) => {
      const [ha, ma] = a.split(':').map(Number); const [hb, mb] = b.split(':').map(Number);
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

  const includeDate = (d: Date) => sortedDates.some(ad => ymd(ad) === ymd(d));

  const handleNext = () => {
    if (!isReady || !date || !time) return;
    onNext?.({ fid, date, time, quantity });
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
                {timesForDate.map(t => (
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
                onClick={() => setQuantity(q => clamp(q - 1, 1, maxQty))}
                disabled={quantity <= 1 || isSoldOut}
                className={styles.qtyBtn}
                aria-label="매수 감소"
              >−</button>
              <span className={styles.qtyVal}>{isSoldOut ? 0 : quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(q => clamp(q + 1, 1, maxQty))}
                disabled={quantity >= maxQty || isSoldOut}
                className={styles.qtyBtn}
                aria-label="매수 증가"
              >+</button>
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
          disabled={!isReady}
          className={styles.nextButton}
          onClick={handleNext}
        >
          예매하기
        </Button>
      </div>
    </aside>
  );
};

export default TicketOrderSection;
