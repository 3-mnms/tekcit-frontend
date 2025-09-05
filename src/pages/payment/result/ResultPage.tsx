// src/pages/payment/ResultPage.tsx
// 주석: 결제 결과 페이지 — URL 쿼리(type/status/paymentId)를 해석하고
//      카드/토스만 서버 confirm 1회 수행, 지갑(KITPAY)은 confirm/환불은 confirm 생략 멍

import { useEffect, useMemo, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

import ResultLayout from '@/components/common/result/ResultLayout'
import { RESULT_CONFIG, type ResultType, type ResultStatus } from '@/shared/config/resultConfig'

// 주석: 카드(토스/PortOne) confirm 전용 API 멍
// import { paymentConfirm as confirmToss } from '@/shared/api/payment/toss'

/* ───────────────────────── Zod: URL 쿼리 검증 ───────────────────────── */
/** 주석: 유효한 type/status/paymentId만 통과 멍 */
const QuerySchema = z.object({
  type: z.union([z.literal('booking'), z.literal('transfer'), z.literal('refund')]).optional(),
  status: z.union([z.literal('success'), z.literal('fail')]).optional(),
  paymentId: z.string().min(1).optional(),
})

export default function ResultPage() {
  const [sp] = useSearchParams()
  const nav = useNavigate()

  /* 주석: 쿼리 파싱 멍 */
  const qType = sp.get('type') ?? undefined
  const qStatus = sp.get('status') ?? undefined
  const qPaymentId = sp.get('paymentId') ?? undefined

  const parsed = QuerySchema.safeParse({ type: qType, status: qStatus, paymentId: qPaymentId })
  const type = (parsed.success ? parsed.data.type : undefined) as ResultType | undefined
  const status = (parsed.success ? parsed.data.status : undefined) as ResultStatus | undefined
  const paymentId = (parsed.success ? parsed.data.paymentId : undefined) as string | undefined

  /* ───────────────────────── 지갑 플로우 판별 ───────────────────────── */
  /**
   * 주석: PasswordInputModal(지갑 결제)에서 payByTekcitPay의 응답 txId를
   *       sessionStorage.setItem(`tx:${paymentId}`, txId) 로 저장해둔다고 가정.
   *       키가 존재하면 "지갑 플로우"로 간주하고 confirm을 **생략**한다 멍.
   */
  const walletTxId = paymentId ? sessionStorage.getItem(`tx:${paymentId}`) ?? undefined : undefined
  const isWalletFlow = Boolean(walletTxId)

  /* 주석: confirm이 필요한 타입만(카드/토스 계열) 지정 — 환불은 제외 멍 */
  const needConfirm = type === 'booking' || type === 'transfer'

  /* 주석: 카드/토스 confirm 중복 호출 방지 멍 */
  const firedRef = useRef<string | null>(null)

  /* ───────────────────────── 카드/토스 confirm 뮤테이션 ───────────────────────── */
  const confirmMut = useMutation({
    mutationFn: async (pid: string) => {
      // 주석: 서버가 PortOne(토스)로 승인 확인 멍
      // return confirmToss(pid)
    },
    onSuccess: () => {
      // 주석: 성공 시 status=success로 고정 멍(문자열 템플릿으로 단순화)
      nav(`/payment/result?type=${type}&status=success&paymentId=${paymentId}`, { replace: true })
    },
    onError: (e: any) => {
      // 주석: 실패 시 status=fail로 고정 멍
      // eslint-disable-next-line no-console
      console.error('[ResultPage] confirm error:', e?.response?.status, e?.response?.data)
      nav(`/payment/result?type=${type}&status=fail&paymentId=${paymentId}`, { replace: true })
    },
  })

  /* ───────────────────────── 효과: confirm 실행 분기 ───────────────────────── */
  useEffect(() => {
    // 주석: paymentId 없으면 실패 처리 멍
    if (!paymentId) {
      nav(`/payment/result?type=${type ?? 'booking'}&status=fail`, { replace: true })
      return
    }

    // 주석: 이미 실패 상태면 추가 작업 X 멍
    if (status === 'fail') return

    // ✅ 주석: 지갑 플로우면 confirm **생략** (이미 서버에서 완료 처리됨) 멍
    if (isWalletFlow) {
      if (status !== 'success') {
        nav(`/payment/result?type=${type}&status=success&paymentId=${paymentId}`, { replace: true })
      }
      return
    }

    // ✅ 주석: 환불 등 confirm이 필요 없는 타입이면 종료 멍
    if (!needConfirm) return

    // ✅ 주석: 카드/토스 플로우 — success + 아직 안 쐈으면 1회 confirm 멍
    if (status === 'success') {
      if (firedRef.current === paymentId) return
      firedRef.current = paymentId
      confirmMut.mutate(paymentId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, paymentId, nav, isWalletFlow, needConfirm])

  /* ───────────────────────── 화면 모델 계산 ───────────────────────── */
  const view = useMemo(() => {
    // 주석: 타입이 정해졌고 실패면 실패 뷰 멍
    if (type && status === 'fail') return RESULT_CONFIG[type]?.fail ?? null

    // 주석: 카드/토스 confirm 대기 중이면 "확인 중" 멍
    if (needConfirm && confirmMut.isPending) {
      return {
        title: '확인 중',
        message: '결제 결과를 확인하고 있습니다...',
        primary: { label: '메인으로', to: '/' },
      }
    }

    // 주석: 지갑 플로우거나, 카드 confirm 완료한 성공/실패 뷰 멍
    if (type && status) return RESULT_CONFIG[type]?.[status] ?? null

    // 주석: 기본 대기 뷰 멍
    return {
      title: '확인 중',
      message: '결제 결과를 확인하고 있습니다...',
      primary: { label: '메인으로', to: '/' },
    }
  }, [type, status, confirmMut.isPending, needConfirm])

  /* ───────────────────────── 렌더 ───────────────────────── */
  return <ResultLayout {...view} />
}
