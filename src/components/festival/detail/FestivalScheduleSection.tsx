import React, { useMemo, useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import { isSameDay } from 'date-fns'
import { ko } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'
import styles from './FestivalScheduleSection.module.css'
import Button from '@/components/common/button/Button'

import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useFestivalDetail } from '@/models/festival/tanstack-query/useFestivalDetail'
import { useAuthStore } from '@/shared/storage/useAuthStore'
import { useUserAgeQuery } from '@/models/festival/tanstack-query/useUserAgeDetail'
import { useEnterWaitingMutation } from '@/models/waiting/tanstack-query/useWaiting'
import type { FestivalDetail } from '@/models/festival/festivalType'

/** YYYY-MM-DD */
const ymd = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

/** 안전 파서 */
const parseYMD = (s?: string): Date | undefined => {
  if (!s) return
  const norm = String(s)
    .trim()
    .replace(/[./]/g, '-')
    .replace(/\s+\d{2}:\d{2}(:\d{2})?$/, '')
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(norm)
  const d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(norm)
  if (isNaN(d.getTime())) return
  d.setHours(0, 0, 0, 0)
  return d
}

/** 요일 숫자→문자 (Sun=0) */
const DOW_KEYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const

const WAIT_W = 1000
const WAIT_H = 700
const BOOK_W = 1000
const BOOK_H = 700

/** HH:mm → Date에 시분 합치기 */
const __fs_combineDateTime = (day: Date, hhmm?: string | null): Date => {
  const d = new Date(day)
  d.setSeconds(0, 0)
  if (!hhmm || hhmm === '공연시작') {
    d.setHours(0, 0, 0, 0)
    return d
  }
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm)
  if (!m) return d
  const h = Math.min(23, parseInt(m[1], 10) || 0)
  const mm = Math.min(59, parseInt(m[2], 10) || 0)
  d.setHours(h, mm, 0, 0)
  return d
}

/** 중앙 팝업 */
const __fs_openCenteredPopup = (
  url: string,
  w: number,
  h: number,
  name: string = 'tekcit-popup',
) => {
  const availLeft = (screen as any).availLeft ?? 0
  const availTop = (screen as any).availTop ?? 0
  const availW = screen.availWidth ?? screen.width
  const availH = screen.availHeight ?? screen.height

  const left = Math.max(availLeft, Math.round(availLeft + (availW - w) / 2))
  const top = Math.max(availTop, Math.round(availTop + (availH - h) / 2))

  const feat = [
    'popup=yes',
    'toolbar=0',
    'menubar=0',
    'location=0',
    'status=0',
    'scrollbars=1',
    'resizable=1',
    `width=${w}`,
    `height=${h}`,
    `left=${left}`,
    `top=${top}`,
  ].join(',')

  window.open(url, name, feat)
}

/** 예매 팝업 */
const __fs_openBookingPopup = (
  fid: string | number,
  date: Date,
  time?: string | null,
  fdfrom?: string | null,
  fdto?: string | null,
) => {
  const params = new URLSearchParams()
  params.set('date', ymd(date))
  if (time) params.set('time', time)
  if (fdfrom) params.set('fdfrom', fdfrom)
  if (fdto) params.set('fdto', fdto)
  params.set('nochat', '1')
  __fs_openCenteredPopup(`/booking/${fid}?${params.toString()}`, BOOK_W, BOOK_H)
}

/** 대기열 팝업 */
const __fs_openWaitingPopup = (
  fid: string | number,
  date: Date,
  time: string | null,
  waitingNumber: number,
  fdfrom?: string | null,
  fdto?: string | null,
) => {
  const params = new URLSearchParams()
  params.set('date', ymd(date))
  if (time) params.set('time', time)
  params.set('wn', String(waitingNumber))
  params.set('skipEnter', '1')
  if (fdfrom) params.set('fdfrom', fdfrom)
  if (fdto) params.set('fdto', fdto)
  params.set('nochat', '1')
  __fs_openCenteredPopup(`/booking/${fid}/queue?${params.toString()}`, WAIT_W, WAIT_H)
}

type Props = {
  /** 부모 페이지에서 이미 받아온 detail (있으면 내부 fetch 생략) */
  detailFromParent?: FestivalDetail
  /** 내부 로딩/에러 문구 숨김 */
  suppressLoading?: boolean
}

const FestivalScheduleSection: React.FC<Props> = ({
  detailFromParent,
  suppressLoading = false,
}) => {
  const params = useParams<{ fid: string }>()
  const fidParam = params.fid ?? ''
  const { fid } = useParams<{ fid: string }>()

  // ✅ detail 주입 여부에 따라 분기
  const hook = useFestivalDetail(fidParam, { enabled: !detailFromParent })
  const detail = (detailFromParent ?? (hook.data as FestivalDetail | undefined)) as
    | FestivalDetail
    | undefined
  const isLoading = detailFromParent ? false : hook.isLoading
  const isError = detailFromParent ? false : hook.isError
  const status = detailFromParent ? 'success' : hook.status

  const { refetch: refetchAge } = useUserAgeQuery({ enabled: false })

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const navigate = useNavigate()
  const location = useLocation()
  const accessToken = useAuthStore((s) => s.accessToken)
  const enterMut = useEnterWaitingMutation()
  const role = useAuthStore((s) => s.user?.role)
  const isUserRole = role === 'USER'

  // 오늘 00:00
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  // 기간
  const startDate = useMemo(() => parseYMD((detail as any)?.prfpdfrom as any), [detail?.prfpdfrom])
  const endDate = useMemo(() => parseYMD((detail as any)?.prfpdto as any), [detail?.prfpdto])
  const isSingleDay = !!startDate && !!endDate && isSameDay(startDate, endDate)

  const effectiveMinDate = useMemo(() => {
    if (!startDate) return today
    return startDate < today ? today : startDate
  }, [startDate, today])

  const allowedDowSet = useMemo(() => {
    const set = new Set<number>()
    const tbd = detail?.timesByDow
    if (tbd && Object.keys(tbd).length > 0) {
      for (const k of Object.keys(tbd)) {
        const idx = DOW_KEYS.indexOf(k as any)
        if (idx >= 0) set.add(idx)
      }
    } else {
      const src = ((detail as any)?.daysOfWeek ?? []) as Array<string | null | undefined>
      for (const v of src) {
        const k = String(v ?? '')
          .trim()
          .slice(0, 3)
          .toUpperCase()
        const idx = DOW_KEYS.indexOf(k as any)
        if (idx >= 0) set.add(idx)
      }
    }
    return set
  }, [detail?.timesByDow, detail?.daysOfWeek])

  const isSelectableDate = (date: Date) => {
    if (effectiveMinDate && date < effectiveMinDate) return false
    if (endDate && date > endDate) return false
    if (isSingleDay && endDate) return isSameDay(date, endDate)

    const dow = date.getDay()
    if (allowedDowSet.size > 0 && !allowedDowSet.has(dow)) return false

    const key = DOW_KEYS[dow]
    const list = detail?.timesByDow?.[key as keyof typeof detail.timesByDow] ?? []
    if (Array.isArray(list) && list.length === 0) return false

    return true
  }

  const [minNavDate, maxNavDate] = useMemo(() => {
    const min = startDate ? (startDate < today ? today : startDate) : today
    const max = endDate ?? min
    return [min, max]
  }, [startDate, endDate, today])

  const availableTimes = useMemo(() => {
    if (!selectedDate) return [] as string[]
    const dowIdx = selectedDate.getDay()
    const key = DOW_KEYS[dowIdx]
    const list = detail?.timesByDow?.[key as any] ?? []
    return Array.isArray(list) ? list : []
  }, [selectedDate, detail?.timesByDow])

  const timesToShow = useMemo(
    () => (availableTimes.length > 0 ? availableTimes : ['공연시작']),
    [availableTimes],
  )

  useEffect(() => {
    if (!selectedDate) return
    setSelectedTime(availableTimes.length > 0 ? availableTimes[0] : null)
  }, [selectedDate, availableTimes])

  useEffect(() => {
    if (!detail) return
    if (selectedDate && selectedTime) return

    let initialDate: Date | null = null
    if (isSingleDay && endDate) {
      if (isSelectableDate(endDate)) initialDate = endDate
    } else if (endDate) {
      const scan = new Date(effectiveMinDate ?? today)
      for (let i = 0; i < 730 && scan <= endDate; i++) {
        if (isSelectableDate(scan)) {
          initialDate = new Date(scan)
          break
        }
        scan.setDate(scan.getDate() + 1)
      }
    } else if (effectiveMinDate && isSelectableDate(effectiveMinDate)) {
      initialDate = effectiveMinDate
    }

    if (initialDate) {
      const key = DOW_KEYS[initialDate.getDay()]
      const list = detail?.timesByDow?.[key as any] ?? []
      setSelectedDate((prev) => prev ?? initialDate)
      setSelectedTime((prev) => prev ?? list[0] ?? null)
    }
  }, [detail, isSingleDay, endDate, effectiveMinDate, today, selectedDate, selectedTime])

  const confirmDisabled = !selectedDate || !selectedTime

  return (
    <>
      <div className={styles.container}>
        {/* 🔇 내부 로딩/에러 문구는 suppressLoading 시 숨김 */}
        {!suppressLoading && !fidParam && <div className={styles.notice}>잘못된 경로입니다.</div>}

        {!suppressLoading && (isLoading || status === 'idle') && (
          <div className={styles.notice}>일정을 불러오는 중… ⏳</div>
        )}

        {!suppressLoading && (isError || (!isLoading && status !== 'idle' && !detail)) && (
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
                onChange={(d) => setSelectedDate(d)}
                minDate={minNavDate}
                maxDate={maxNavDate}
                filterDate={isSelectableDate}
                openToDate={minNavDate}
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
                dayClassName={(date) => {
                  const selectable = isSelectableDate(date)
                  const isSel = selectedDate && isSameDay(date, selectedDate)
                  const isToday = isSameDay(date, new Date())
                  const isWeekend = [0, 6].includes(date.getDay())
                  return [
                    'custom-day',
                    selectable ? 'day-active' : 'day-inactive',
                    isSel ? 'day-selected' : '',
                    isToday ? 'day-today' : '',
                    isWeekend ? 'day-weekend' : '',
                  ].join(' ')
                }}
              />
            </div>

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
                // (기존 onClick 로직 그대로)
                if (!accessToken) {
                  alert('로그인이 필요한 서비스입니다.')
                  const redirect = location.pathname + location.search
                  navigate(`/login?redirect=${encodeURIComponent(redirect)}`)
                  return
                }

                if (!isUserRole) {
                  alert(
                    '관리자 또는 주최자 계정으로는 예매를 진행할 수 없습니다.\n일반 사용자 계정으로 로그인해 주세요.',
                  )
                  return
                }

                const ageText = detail?.prfage ?? null

                const parseMinAge = (raw?: string | null): number | null => {
                  if (!raw) return null
                  const s = String(raw).replace(/\s+/g, '')
                  if (/(전체관람가|전연령|ALL)/i.test(s)) return 0
                  const m = s.match(/(?:만)?(\d+)\s*세\s*이상?/)
                  if (m && m[1]) {
                    const n = parseInt(m[1], 10)
                    if (!isNaN(n)) return n
                  }
                  return null
                }

                const minAge = parseMinAge(ageText)
                if (minAge !== null && minAge > 0) {
                  try {
                    const { data: userAge } = await refetchAge()
                    if (userAge == null) {
                      alert('나이 확인에 실패했어요. 잠시 후 다시 시도해 주세요.')
                      return
                    }
                    if (userAge < minAge) {
                      alert('관람연령 이상만 예매 가능한 공연입니다.')
                      return
                    }
                  } catch (e) {
                    console.error(e)
                    alert('나이 확인에 실패했어요. 잠시 후 다시 시도해 주세요.')
                    return
                  }
                }

                const FORCE_WAIT = true // 테스트 끝나면 false
                if (FORCE_WAIT && selectedDate && fid) {
                  const fdfrom = startDate ? ymd(startDate) : null
                  const fdto = endDate ? ymd(endDate) : null
                  __fs_openWaitingPopup(fid, selectedDate, selectedTime, 10000, fdfrom, fdto)
                  return
                }

                const fdfrom = startDate ? ymd(startDate) : null
                const fdto = endDate ? ymd(endDate) : null
                if (!selectedDate) return
                const reservationDateTime = __fs_combineDateTime(selectedDate, selectedTime)

                try {
                  const res = await enterMut.mutateAsync({
                    festivalId: fidParam,
                    reservationDate: reservationDateTime,
                  })

                  if (res.immediateEntry) {
                    __fs_openBookingPopup(fidParam, selectedDate, selectedTime, fdfrom, fdto)
                  } else {
                    __fs_openWaitingPopup(
                      fidParam,
                      selectedDate,
                      selectedTime,
                      res.waitingNumber,
                      fdfrom,
                      fdto,
                    )
                  }
                } catch (err) {
                  console.error('[enter waiting] error:', err)
                  alert(' 진입에 실패했어요. 잠시 후 다시 시도해 주세요.')
                }
              }}
            >
              예매하기
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

export default FestivalScheduleSection
