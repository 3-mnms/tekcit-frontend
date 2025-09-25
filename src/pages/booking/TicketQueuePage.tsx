import React, { useMemo, useRef, useEffect, useCallback, useState, startTransition } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import WaitingQueue from '@/components/booking/waiting/WaitingQueue'
import styles from './TicketQueuePage.module.css'
import { useFestivalDetail } from '@/models/festival/tanstack-query/useFestivalDetail'
import { useExitWaitingMutation } from '@/models/waiting/tanstack-query/useWaiting'
import { useAuthStore } from '@/shared/storage/useAuthStore'

import SockJS from 'sockjs-client'
import { Client, type IMessage, type StompHeaders } from '@stomp/stompjs'
import { useTokenInfoQuery } from '@/shared/api/useTokenInfoQuery'
import { getEnv } from '@/shared/config/env'

/* =========================
   환경/토픽 설정
   ========================= */
const WS_URL = getEnv('API_URL', '') + '/ws'
// const WS_URL = 'http://localhost:10000/ws'

const makeBroadcastTopic = (fid: string, date: string, time?: string) => {
  const d = date?.trim()
  const t = time?.trim()
  return t ? `/topic/waiting/${fid}/${d}/${t}` : `/topic/waiting/${fid}/${d}`
}
// const USER_QUEUE_TOPIC = '/user/queue/waitingNumber'

/* =========================
   유틸
   ========================= */
const SMALL_W = 1000
const SMALL_H = 700

const parseYMD = (s?: string) => {
  if (!s) return undefined
  const t = s.trim().replace(/[./]/g, '-')
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t)
  const d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(t)
  if (isNaN(d.getTime())) return undefined
  d.setHours(0, 0, 0, 0)
  return d
}

const combineDateTime = (day?: Date, hhmm?: string | null) => {
  if (!day) return undefined
  const d = new Date(day)
  if (!hhmm || hhmm === '공연시작') {
    d.setHours(0, 0, 0, 0)
    return d
  }
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm)
  if (!m) return d
  d.setHours(Math.min(23, +m[1] || 0), Math.min(59, +m[2] || 0), 0, 0)
  return d
}

const centerAndResizeExact = (targetInnerW: number, targetInnerH: number) => {
  try {
    const dw = Math.max(0, window.outerWidth - window.innerWidth)
    const dh = Math.max(0, window.outerHeight - window.innerHeight)
    const targetOuterW = Math.round(targetInnerW + dw)
    const targetOuterH = Math.round(targetInnerH + dh)

    const availLeft = (screen as any).availLeft ?? 0
    const availTop = (screen as any).availTop ?? 0
    const availW = screen.availWidth ?? screen.width
    const availH = screen.availHeight ?? screen.height

    const left = Math.max(availLeft, Math.round(availLeft + (availW - targetOuterW) / 2))
    const top = Math.max(availTop, Math.round(availTop + (availH - targetOuterH) / 2))

    window.resizeTo(targetOuterW, targetOuterH)
    window.moveTo(left, top)
  } catch {}
}

/* =========================
   페이지
   ========================= */
const TicketQueuePage: React.FC = () => {
  const { data: tokenInfo } = useTokenInfoQuery()
  const myUserId = tokenInfo?.userId ?? null
  const { fid } = useParams<{ fid: string }>()
  const [sp] = useSearchParams()
  const navigate = useNavigate()

  const { data: detail } = useFestivalDetail(fid ?? '')
  const title = (detail as any)?.prfnm || (detail as any)?.title || '공연'

  const date = sp.get('date') ?? ''
  const time = sp.get('time') ?? ''
  const fdfrom = sp.get('fdfrom') ?? ''
  const fdto = sp.get('fdto') ?? ''
  const initialWN = Number(sp.get('wn') ?? '0')

  const posterUrl =
    (detail as any)?.poster ||
    (detail as any)?.posterUrl ||
    (detail as any)?.posterPath ||
    (detail as any)?.mainImg ||
    (detail as any)?.img ||
    undefined

  const TOTAL_AHEAD = Math.max(0, Number.isFinite(initialWN) ? initialWN : 0)
  const [ahead, setAhead] = useState(TOTAL_AHEAD)

  const proceedingToBookingRef = useRef(false)
  const isUnmountedRef = useRef(false)
  const wsActiveRef = useRef(false)
  const stompRef = useRef<Client | null>(null)
  const lastMsgAtRef = useRef<number>(Date.now())
  const heartbeatWatchdogRef = useRef<number | null>(null) 

  const exitMut = useExitWaitingMutation()

  const reservationDate = useMemo(
    () => combineDateTime(parseYMD(date || undefined), time || null),
    [date, time],
  )

  const accessToken = useAuthStore((s) => s.accessToken)

  const connectHeadersRef = useRef<StompHeaders | undefined>()
  useEffect(() => {
    connectHeadersRef.current = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
  }, [accessToken])

  const navParamsRef = useRef({ fid, date, time, fdfrom, fdto })
  useEffect(() => {
    navParamsRef.current = { fid, date, time, fdfrom, fdto }
  }, [fid, date, time, fdfrom, fdto])

  const proceedToBooking = useCallback(() => {
    const { fid, date, time, fdfrom, fdto } = navParamsRef.current
    if (!fid || proceedingToBookingRef.current) return

    proceedingToBookingRef.current = true
    const params = new URLSearchParams()
    if (date) params.set('date', date)
    if (time) params.set('time', time)
    if (fdfrom) params.set('fdfrom', fdfrom)
    if (fdto) params.set('fdto', fdto)

    startTransition(() => {
      navigate(`/booking/${fid}?${params.toString()}`)
    })
  }, [navigate])

  const extractAhead = (raw: any): number | undefined => {
    let n: number | undefined =
      raw?.ahead ??
      raw?.waitingNumber ??
      raw?.waiting_number ??
      raw?.peopleAhead ??
      raw?.queue?.peopleAhead ??
      raw?.queue?.ahead

    if (typeof n !== 'number' || !isFinite(n)) return undefined

    return Math.max(0, Math.floor(n))
  }

  const handleQueueMessage = useCallback(
    (msg: IMessage) => {
      if (isUnmountedRef.current) return
      try {
        const data = JSON.parse(msg.body || '{}')

        // 입장 이벤트
        if (
          data?.type === 'PROCEED' ||
          data?.event === 'PROCEED' ||
          data?.status === 'ENTER_BOOKING'
        ) {
          setAhead(0)
          proceedToBooking()
          return
        }

        // 숫자 업데이트
        const next = extractAhead(data)
        if (typeof next === 'number') {
          setAhead((prev) => (prev !== next ? next : prev))
        }

        lastMsgAtRef.current = Date.now()
      } catch (e) {
        console.warn('[WS] message parse error', e, msg.body)
      }
    },
    [proceedToBooking],
  )

  useEffect(() => {
    centerAndResizeExact(SMALL_W, SMALL_H)
    const t = setTimeout(() => centerAndResizeExact(SMALL_W, SMALL_H), 0)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!fid || !date || !myUserId || wsActiveRef.current) return

    const client = new Client({
      webSocketFactory: () => new SockJS(`${WS_URL}?token=Bearer ${accessToken}`),
      connectHeaders: { Authorization: `Bearer ${accessToken}`, userId: String(myUserId) },
      reconnectDelay: 5000,
    })

    client.onConnect = () => {
      lastMsgAtRef.current = Date.now()

      client.subscribe('/user/queue/waitingNumber', handleQueueMessage)
      const broad = makeBroadcastTopic(String(fid), date, time || undefined)
      client.subscribe(broad, handleQueueMessage)

      if (heartbeatWatchdogRef.current == null) {
        heartbeatWatchdogRef.current = window.setInterval(() => {
          const SILENCE_MS = 15_000
          if (!proceedingToBookingRef.current && Date.now() - lastMsgAtRef.current > SILENCE_MS) {
            proceedToBooking()
          }
        }, 3000)
      }

      wsActiveRef.current = true
      stompRef.current = client
    }

    client.onDisconnect = () => {
      if (heartbeatWatchdogRef.current != null) {
        clearInterval(heartbeatWatchdogRef.current)
        heartbeatWatchdogRef.current = null
      }
      wsActiveRef.current = false
      stompRef.current = null
    }

    client.activate()

    return () => {
      if (heartbeatWatchdogRef.current != null) {
        clearInterval(heartbeatWatchdogRef.current)
        heartbeatWatchdogRef.current = null
      }
      try {
        client.deactivate()
      } catch {}
      wsActiveRef.current = false
      stompRef.current = null
    }
  }, [fid, date, time, myUserId, accessToken, handleQueueMessage, proceedToBooking])

  useEffect(() => {
    isUnmountedRef.current = false
    if (!fid || !reservationDate) {
      return () => {
        isUnmountedRef.current = true
      }
    }
    const callExit = () => {
      if (proceedingToBookingRef.current || isUnmountedRef.current) return
      try {
        exitMut.mutate({ festivalId: String(fid), reservationDate })
      } catch {}
    }
    window.addEventListener('pagehide', callExit)
    window.addEventListener('beforeunload', callExit)
    return () => {
      isUnmountedRef.current = true
      if (!proceedingToBookingRef.current) callExit()
      window.removeEventListener('pagehide', callExit)
      window.removeEventListener('beforeunload', callExit)
    }
  }, [fid, reservationDate, exitMut])

  // ✅ body 스크롤 잠금
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    const prevTouch = document.body.style.touchAction
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.touchAction = prevTouch
    }
  }, [])

  const progress =
    TOTAL_AHEAD === 0
      ? 100
      : Math.min(100, Math.max(0, ((TOTAL_AHEAD - ahead) / TOTAL_AHEAD) * 100))

  return (
    <div className={`${styles.page} ${styles.fullwrap}`}>
      <WaitingQueue
        title={title}
        dateTime={date ? `${date}${time ? ' ' + time : ''}` : '일정 미지정'}
        waitingCount={ahead}
        progressPct={Math.max(2, Math.round(progress))}
        posterUrl={posterUrl}
      />
    </div>
  )
}

export default TicketQueuePage