// src/pages/result/ResultPage.tsx
import { useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import ResultLayout from '@/components/common/result/ResultLayout'
import { RESULT_CONFIG, type ResultType, type ResultStatus } from '@/shared/config/resultConfig'

export default function ResultPage() {
  const [sp] = useSearchParams()
  const nav = useNavigate()
  const type = sp.get('type') as ResultType | null
  const status = sp.get('status') as ResultStatus | null
  const id = sp.get('paymentId') ?? sp.get('txId') ?? undefined

  // 서버 검증 훅 (선택) 멍
  useEffect(() => {
    if (!type || !status) return
    // fetch(`/api/payments/verify?type=${type}&id=${id ?? ''}`)
    //   .then(r => r.json())
    //   .then(v => { if (!v.ok) nav(`/payment/result?type=${type}&status=fail`) })
    //   .catch(() => nav(`/payment/result?type=${type}&status=fail`))
  }, [type, status, id, nav])

  const view = useMemo(() => (type && status ? RESULT_CONFIG[type]?.[status] : null), [type, status])

  if (!view) {
    return (
      <ResultLayout
        title="결과 확인 불가"
        message="결제 결과를 확인할 수 없습니다."
        primary={{ label: '메인으로', to: '/' }}
      />
    )
  }
  return <ResultLayout {...view} />
}
