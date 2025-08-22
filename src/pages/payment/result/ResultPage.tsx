import { useEffect, useMemo, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import ResultLayout from '@/components/common/result/ResultLayout'
import { RESULT_CONFIG, type ResultType, type ResultStatus } from '@/shared/config/resultConfig'
import { paymentConfirm } from '@/shared/api/payment/toss'

export default function ResultPage() {
  const [sp] = useSearchParams()
  const nav = useNavigate()

  const type = sp.get('type') as ResultType | null
  const status = sp.get('status') as ResultStatus | null
  const id = sp.get('paymentId') ?? sp.get('txId') ?? undefined

  // ✅ 중복 실행 방지 멍
  const didRun = useRef(false)

  // ✅ status가 비어 있을 때만 confirm 수행 멍
  useEffect(() => {
    if (didRun.current) return
    if (!type) return           // type 없으면 진행 불가 멍
    if (status) return          // 이미 확정 상태면 스킵 멍
    if (!id) return             // 확인 대상 ID 없으면 스킵 멍

    didRun.current = true

    ;(async () => {
      try {
        await paymentConfirm(id) 
        const usp = new URLSearchParams(sp)
        usp.set('status', 'success') // ✅ 성공 확정 멍
        nav({ pathname: '/payment/result', search: usp.toString() }, { replace: true })
      } catch {
        const usp = new URLSearchParams(sp)
        usp.set('status', 'fail')    // ❌ 실패 확정 멍
        nav({ pathname: '/payment/result', search: usp.toString() }, { replace: true })
      }
    })()
  }, [type, status, id, nav, sp])

  // ✅ 렌더 뷰 결정 멍
  const view = useMemo(() => (type && status ? RESULT_CONFIG[type]?.[status] : null), [type, status])

  // ✅ status 미확정 시 스피너/로딩 뷰 멍
  if (!view) {
    return (
      <ResultLayout
        title="결제 완료됨"
        message="결제 상태를 확인하고 있어요… 잠시만요 멍"
        primary={{ label: '메인으로', to: '/' }}
      />
    )
  }

  // ✅ 완료/실패 최종 뷰 렌더 멍
  return <ResultLayout {...view} />
}
