import { useEffect, useMemo, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

import ResultLayout from '@/components/common/result/ResultLayout'
import { RESULT_CONFIG, type ResultType, type ResultStatus } from '@/shared/config/resultConfig'
import { useReleaseWaitingMutation } from '@/models/waiting/tanstack-query/useWaiting'
import { completePayment } from '@/shared/api/payment/payments'

// YYYY-MM-DD → Date(00:00)
const parseYMD = (s?: string) => {
  if (!s) return undefined
  const t = s.trim().replace(/[./]/g, '-')
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t)
  const d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(t)
  if (isNaN(d.getTime())) return undefined
  d.setHours(0, 0, 0, 0)
  return d
}

// Date + "HH:mm" → Date
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

const QuerySchema = z.object({
  type: z.union([z.literal('booking'), z.literal('transfer'), z.literal('refund')]).optional(),
  status: z.union([z.literal('success'), z.literal('fail')]).optional(),
  paymentId: z.string().min(1).optional(),
})

export default function ResultPage() {
  const [sp] = useSearchParams()
  const nav = useNavigate()

  const parsed = QuerySchema.safeParse({
    type: sp.get('type') ?? undefined,
    status: sp.get('status') ?? undefined,
    paymentId: sp.get('paymentId') ?? undefined,
  })
  const type = (parsed.success ? parsed.data.type : undefined)
  const status = (parsed.success ? parsed.data.status : undefined)
  const paymentId = (parsed.success ? parsed.data.paymentId : undefined)

  const isSuccess = status === 'success'

  const needConfirm = type === 'booking' || type === 'transfer'

  const releaseMut = useReleaseWaitingMutation()
  const releasedOnceRef = useRef(false)
  useEffect(() => {
    if (type !== 'booking') return
    if (releasedOnceRef.current) return
    releasedOnceRef.current = true

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
        releaseMut.mutate({ festivalId: String(festivalId), reservationDate: dt })
      }
    } finally {
      sessionStorage.removeItem('tekcit:waitingRelease')
    }
  }, [type, releaseMut])

  const firedRef = useRef(false)
  const confirmMut = useMutation({
    mutationFn: async () => {
      if (!paymentId) throw new Error('Missing paymentId')
      await completePayment(paymentId)
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
    if (!paymentId) return
    if (firedRef.current) return
    if (status === 'fail') return
    firedRef.current = true
    confirmMut.mutate()
  }, [needConfirm, paymentId, status, confirmMut])

  const view = useMemo(() => {
    if (type && status) {
      const config = RESULT_CONFIG[type]?.[status]
      if (!config) return null
      return {
        title: config.title,
        message: config.message,
        primary: config.primary,
        isSuccess: status === 'success',
        warningMessage: config.warning, // warning 속성 추가
      }
    }
    return null
  }, [type, status])

  return view ? <ResultLayout {...view} /> : null
}
