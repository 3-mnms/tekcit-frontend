// src/pages/payment/ResultPage.tsx
import { useEffect, useMemo, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

import ResultLayout from '@/components/common/result/ResultLayout'
import { RESULT_CONFIG, type ResultType, type ResultStatus } from '@/shared/config/resultConfig'
import { useReleaseWaitingMutation } from '@/models/waiting/tanstack-query/useWaiting'

/** 쿼리 파싱 */
const QuerySchema = z.object({
  type: z.union([z.literal('booking'), z.literal('transfer'), z.literal('refund')]).optional(),
  status: z.union([z.literal('success'), z.literal('fail')]).optional(),
  paymentId: z.string().min(1).optional(),
})

/** YYYY-MM-DD -> Date(00:00) */
const parseYMD = (s?: string) => {
  if (!s) return undefined
  const t = s.trim().replace(/[./]/g, '-')
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t)
  const d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(t)
  if (isNaN(d.getTime())) return undefined
  d.setHours(0, 0, 0, 0)
  return d
}

/** Date + "HH:mm" -> Date */
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

export default function ResultPage() {
  const [sp] = useSearchParams()
  const nav = useNavigate()

  const qType = sp.get('type') ?? undefined
  const qStatus = sp.get('status') ?? undefined
  const qPaymentId = sp.get('paymentId') ?? undefined

  const parsed = QuerySchema.safeParse({ type: qType, status: qStatus, paymentId: qPaymentId })
  const type = (parsed.success ? parsed.data.type : undefined) as ResultType | undefined
  const status = (parsed.success ? parsed.data.status : undefined) as ResultStatus | undefined

  // 기존 플로우 유지
  const needConfirm = type === 'booking' || type === 'transfer'

  // ─────────────────────────────────────────────
  // ✅ 결제 완료(성공/실패 모두) 시 release 1회 호출
  // ─────────────────────────────────────────────
  const releaseMut = useReleaseWaitingMutation()
  const releasedOnceRef = useRef(false)

  useEffect(() => {
    // booking 결과 페이지에 들어왔을 때만 release 시도
    if (type !== 'booking') return
    if (releasedOnceRef.current) return
    releasedOnceRef.current = true

    // BookingPaymentPage에서 requestPay 직전에 저장해 둔 값 복구
    // sessionStorage.setItem('tekcit:waitingRelease', JSON.stringify({
    //   festivalId, performanceDate, performanceTime
    // }))
    const raw = sessionStorage.getItem('tekcit:waitingRelease')
    if (!raw) return

    try {
      const { festivalId, performanceDate, performanceTime } = JSON.parse(raw) as {
        festivalId?: string | number
        performanceDate?: string
        performanceTime?: string | null
      }

      const day = parseYMD(performanceDate)
      const dt = combineDateTime(day, performanceTime ?? null)

      if (festivalId && dt) {
        releaseMut.mutate({
          festivalId: String(festivalId),
          reservationDate: dt,
        })
      }
    } catch {
      // noop
    } finally {
      // 재호출 방지
      sessionStorage.removeItem('tekcit:waitingRelease')
    }
  }, [type, releaseMut])

  // ─────────────────────────────────────────────
  // ✅ 네가 쓰던 confirm 플로우(transfer/booking 확인) 유지
  // ─────────────────────────────────────────────
  const firedRef = useRef<string | null>(null)
  const confirmMut = useMutation({
    mutationFn: async () => {
      // 여기에 결제 결과 확인 API가 있다면 호출
      // ex) await apiConfirmPayment({ paymentId: qPaymentId })
      return true
    },
    onSuccess: () => {
      nav(`/payment/result?type=${type}&status=success`, { replace: true })
    },
    onError: () => {
      nav(`/payment/result?type=${type}&status=fail`, { replace: true })
    },
  })

  useEffect(() => {
    if (!needConfirm) return
    if (status === 'fail') return // 실패는 확인 스킵(이미 결과 확정)
    if (status === 'success') {
      if (firedRef.current) return
      firedRef.current = '1'
      confirmMut.mutate()
    }
  }, [status, needConfirm, confirmMut])

  console.log(confirmMut);
  
  // ─────────────────────────────────────────────
  // ✅ 뷰 구성 (기존 유지)
  // ─────────────────────────────────────────────
  const view = useMemo(() => {
    if (type && status === 'fail') return RESULT_CONFIG[type]?.fail ?? null

    if (type && status==="success") return RESULT_CONFIG[type]?.success ?? null

  }, [type, status, confirmMut.isPending, needConfirm])

  return <ResultLayout {...view} />
}
