// ResultPage.tsx
import { useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import ResultLayout from '@/components/common/result/ResultLayout'
import { RESULT_CONFIG, type ResultType, type ResultStatus } from '@/shared/config/resultConfig'
import { paymentConfirm } from '@/shared/api/payment/toss' // 주석: 실제 경로 맞게 확인 멍

export default function ResultPage() {
  const [sp] = useSearchParams()
  const nav = useNavigate()

  // 주석: 필수 파라미터 꺼내기
  const type = sp.get('type') as ResultType          
  const status = sp.get('status') as ResultStatus   
  const paymentId = sp.get('paymentId')

  useEffect(() => {

    // 주석: 백엔드 confirm은 paymentId(path)만 필요 → orderId(or paymentId)가 없으면 실패 처리 멍
    if (!paymentId) {
      const usp = new URLSearchParams(sp)
      usp.set('status', 'fail')
      nav({ pathname: '/payment/result', search: usp.toString() }, { replace: true })
      return
    }

    ;(async () => {
      try {
        // ✅ 결제 결과 확인 API 호출 (paymentId = orderId) 멍
        await paymentConfirm(paymentId)

        const usp = new URLSearchParams(sp)
        usp.set('status', 'success')

        // ✅ 동일 페이지에서 쿼리만 업데이트하여 결과 렌더 유도 멍
        nav({ pathname: '/payment/result', search: usp.toString() }, { replace: true })
      } catch (e) {
        const usp = new URLSearchParams(sp)
        usp.set('status', 'fail')
        nav({ pathname: '/payment/result', search: usp.toString() }, { replace: true })
      }
    })()
  }, [status, paymentId, nav, sp])

  // ✅ 렌더 뷰 결정 멍
  const view = useMemo(() => (type && status ? RESULT_CONFIG[type]?.[status] : null), [type, status])

  // ✅ status 미확정 시 스피너/로딩 뷰 멍
  if (!view) {
    return (
      <ResultLayout
        title="성공"
        message="결제가 완료되었습니다."
        primary={{ label: '메인으로', to: '/' }}
      />
    )
  }

  // ✅ 완료/실패 최종 뷰 렌더 멍
  return <ResultLayout {...view} />
}
