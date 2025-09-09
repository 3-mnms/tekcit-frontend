// src/pages/payment/ResultPage.tsx
import { useEffect, useMemo, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

import ResultLayout from '@/components/common/result/ResultLayout'
import { RESULT_CONFIG, type ResultType, type ResultStatus } from '@/shared/config/resultConfig'

const QuerySchema = z.object({
  type: z.union([z.literal('booking'), z.literal('transfer'), z.literal('refund')]).optional(),
  status: z.union([z.literal('success'), z.literal('fail')]).optional(),
  paymentId: z.string().min(1).optional(),
})

export default function ResultPage() {
  const [sp] = useSearchParams()
  const nav = useNavigate()

  const qType = sp.get('type') ?? undefined
  const qStatus = sp.get('status') ?? undefined
  const qPaymentId = sp.get('paymentId') ?? undefined

  console.log(qType,qStatus,qPaymentId);
  

  const parsed = QuerySchema.safeParse({ type: qType, status: qStatus, paymentId: qPaymentId })
  const type = (parsed.success ? parsed.data.type : undefined) as ResultType | undefined
  const status = (parsed.success ? parsed.data.status : undefined) as ResultStatus | undefined
  const paymentId = (parsed.success ? parsed.data.paymentId : undefined) as string | undefined

  const needConfirm = type === 'booking' || type === 'transfer'

  const firedRef = useRef<string | null>(null)

  const confirmMut = useMutation({
    mutationFn: async (pid: string) => {
    },
    onSuccess: () => {
      nav(`/payment/result?type=${type}&status=success&paymentId=${paymentId}`, { replace: true })
    },
    onError: (e: any) => {
      console.error('[ResultPage] confirm error:', e?.response?.status, e?.response?.data)
      nav(`/payment/result?type=${type}&status=fail&paymentId=${paymentId}`, { replace: true })
    },
  })

  useEffect(() => {
    if (status === 'fail') return

    if (!needConfirm) return

    if (status === 'success') {
      if (firedRef.current === paymentId) return
      firedRef.current = paymentId
      confirmMut.mutate(paymentId)
    }
  }, [status, paymentId, nav, needConfirm])

  const view = useMemo(() => {
    if (type && status === 'fail') return RESULT_CONFIG[type]?.fail ?? null

    if (needConfirm && confirmMut.isPending) {
      return {
        title: '확인 중',
        message: '결제 결과를 확인하고 있습니다...',
        primary: { label: '메인으로', to: '/' },
      }
    }

    if (type && status) return RESULT_CONFIG[type]?.[status] ?? null

    return {
      title: '확인 중',
      message: '결제 결과를 확인하고 있습니다...',
      primary: { label: '메인으로', to: '/' },
    }
  }, [type, status, confirmMut.isPending, needConfirm])

  return <ResultLayout {...view} />
}
