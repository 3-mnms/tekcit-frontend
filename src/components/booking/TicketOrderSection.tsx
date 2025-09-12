import React from 'react'
import DatePicker from 'react-datepicker'
import { ko } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'
import Button from '@/components/common/button/Button'
import styles from './TicketOrderSection.module.css'

type NextPayload = {
  fid?: string
  date: Date
  time: string
  quantity: number
}

type Props = {
  fid?: string

  selectedDate?: Date | null
  selectedTime?: string | null

  availableDates?: Array<Date | string> | null
  timesByDate?: Record<string, string[]> | null

  pricePerTicket?: number
  maxQuantity?: number
  initialQuantity?: number

  /** 부모에서 예약 API 호출 */
  onNext?: (payload: NextPayload) => void

  /** 선택 변경 시 부모에 전달 (date, time, quantity) */
  onSelectionChange?: (date: Date | null, time: string | null, quantity: number) => void

  /** 데모 데이터 사용 여부 (기본 false로 쓰길 권장) */
  useDemoIfEmpty?: boolean
  className?: string
}

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(
    2,
    '0',
  )}`

const formatPrice = (n: number) =>
  new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(n)

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

function makeDemo() {
  const base = new Date()
  const d1 = new Date(base)
  d1.setDate(base.getDate() + 2)
  const d2 = new Date(base)
  d2.setDate(base.getDate() + 5)
  return {
    dates: [d1, d2],
    times: { [ymd(d1)]: ['14:00', '18:00'], [ymd(d2)]: ['16:00'] },
    price: 88000,
    maxQty: 4,
  }
}

const TicketOrderSection: React.FC<Props> = ({
  fid,
  selectedDate,
  selectedTime,
  availableDates = [],
  timesByDate = {},
  pricePerTicket,
  maxQuantity,
  initialQuantity = 1,
  onNext,
  onSelectionChange,
  useDemoIfEmpty = false,
  className = '',
}) => {
  // 1) 날짜 목록 normalize
  const normalizedDates = React.useMemo<Date[]>(
    () =>
      (Array.isArray(availableDates) ? availableDates : [])
        .map((d) => (d instanceof Date ? new Date(d) : new Date(String(d))))
        .filter((d) => !isNaN(d.getTime())),
    [availableDates],
  )

  // 데모 대체
  const demo = useDemoIfEmpty && normalizedDates.length === 0 ? makeDemo() : null
  const dates = demo ? demo.dates : normalizedDates
  const tbd = demo ? demo.times : (timesByDate ?? {})
  const unitPrice = demo ? demo.price : (pricePerTicket ?? 88000)
  const maxQty = demo ? demo.maxQty : (maxQuantity ?? 4)
  const isSoldOut = maxQty <= 0

  // 2) 날짜 정렬 및 범위
  const sortedDates = React.useMemo(
    () => [...dates].sort((a, b) => a.getTime() - b.getTime()),
    [dates],
  )
  const minDate = sortedDates[0] ?? null
  const maxDate = sortedDates[sortedDates.length - 1] ?? null

  // 3) 상태: date
  const [date, setDate] = React.useState<Date | null>(selectedDate ?? minDate ?? null)

  // 4) 날짜별 시간 계산 헬퍼 (중복 제거 + 오름차순 정렬)
  const getTimesFor = React.useCallback(
    (d: Date | null) => {
      if (!d) return []
      const arr = (tbd[ymd(d)] ?? []) as string[]
      return Array.from(new Set(arr)).sort((a, b) => {
        const [ha, ma] = a.split(':').map(Number)
        const [hb, mb] = b.split(':').map(Number)
        return ha * 60 + ma - (hb * 60 + mb)
      })
    },
    [tbd],
  )

  // 5) 선택된 날짜의 시간 목록
  const timesForDate = React.useMemo(() => getTimesFor(date), [date, getTimesFor])

  // 6) 상태: time (초기값은 selectedTime 또는 가장 이른 시간)
  const [time, setTime] = React.useState<string | null>(
    selectedTime && timesForDate.includes(selectedTime) ? selectedTime : (timesForDate[0] ?? null),
  )

  // ✅ 날짜 변경 시점에서 즉시 time 보정 (같은 시간이 없으면 가장 이른 시간으로 자동 선택)
  const handleChangeDate = (d: Date | null) => {
    setDate(d)
    const list = getTimesFor(d)
    if (list.length === 0) {
      setTime(null)
    } else if (!time || !list.includes(time)) {
      setTime(list[0]) // 가장 빠른 시간 자동 선택
    } // 같은 시간이 있으면 유지
  }

  // 7) 수량
  const [quantity, setQuantity] = React.useState(clamp(initialQuantity, 1, Math.max(1, maxQty)))
  const totalPrice = unitPrice * (isSoldOut ? 0 : quantity)
  const isReady = !!date && !!time && !isSoldOut

  const includeDate = (d: Date) => sortedDates.some((ad) => ymd(ad) === ymd(d))

  // 8) 부모에게 선택 변경 통지 (항상 유효 조합만 전달)
  React.useEffect(() => {
    const list = getTimesFor(date)
    const safeTime = time && list.includes(time) ? time : (list[0] ?? null)
    if (safeTime !== time) {
      setTime(safeTime)
      return // 다음 effect에서 onSelectionChange 호출
    }
    onSelectionChange?.(date, safeTime, quantity)
  }, [date, time, quantity, getTimesFor, onSelectionChange])

  // 9) 더블클릭 가드
  const clickLockRef = React.useRef(false)
  const handleNext = () => {
    if (!isReady || !date || !time) return
    if (clickLockRef.current) return
    clickLockRef.current = true
    try {
      onNext?.({ fid, date, time, quantity })
    } finally {
      clickLockRef.current = false
    }
  }

  return (
    <aside className={`${styles.section} ${className || ''}`} aria-label="예매 선택 패널">
      <h2 className={styles.header}>예매 정보</h2>

      <div className={styles.content}>
        <div className={styles.topGrid}>
          <div>
            <div className={styles.dpCard}>
              <DatePicker
                selected={date}
                onChange={handleChangeDate}
                locale={ko}
                inline
                filterDate={includeDate}
                includeDates={sortedDates}
                minDate={minDate ?? undefined}
                maxDate={maxDate ?? undefined}
                showDisabledMonthNavigation
                renderCustomHeader={({
                  date,
                  decreaseMonth,
                  increaseMonth,
                  prevMonthButtonDisabled,
                  nextMonthButtonDisabled,
                }) => (
                  <div className={styles.dpHeader}>
                    <button
                      type="button"
                      onClick={decreaseMonth}
                      disabled={prevMonthButtonDisabled}
                      className={styles.dpNavBtn}
                      aria-label="이전 달"
                    >
                      ‹
                    </button>
                    <div className={styles.dpMonthTitle}>
                      {date.getFullYear()}년 {String(date.getMonth() + 1).padStart(2, '0')}월
                    </div>
                    <button
                      type="button"
                      onClick={increaseMonth}
                      disabled={nextMonthButtonDisabled}
                      className={styles.dpNavBtn}
                      aria-label="다음 달"
                    >
                      ›
                    </button>
                  </div>
                )}
                formatWeekDay={(nameOfDay) => nameOfDay.slice(0, 1)}
                dayClassName={(d) => {
                  const isSel = !!date && ymd(d) === ymd(date)
                  const isWeekend = [0, 6].includes(d.getDay())
                  return [
                    'custom-day',
                    includeDate(d) ? 'day-active' : 'day-inactive',
                    isSel ? 'day-selected' : '',
                    isWeekend ? 'day-weekend' : '',
                  ].join(' ')
                }}
              />
            </div>
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
                disabled={quantity <= 1 || isSoldOut}
                className={styles.qtyBtn}
                aria-label="매수 감소"
              >
                −
              </button>
              <span className={styles.qtyVal}>{isSoldOut ? 0 : quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => clamp(q + 1, 1, maxQty))}
                disabled={quantity >= maxQty || isSoldOut}
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
          disabled={!isReady}
          className={styles.nextButton}
          onClick={handleNext}
        >
          예매하기
        </Button>
      </div>
    </aside>
  )
}

export default TicketOrderSection
