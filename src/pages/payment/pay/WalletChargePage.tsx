// src/pages/payment/wallet/WalletChargePage.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { usePaymentStatus } from '@/models/payment/hooks/usePaymentStatus'
import PortOne, { Currency, PayMethod } from '@portone/browser-sdk/v2'

import styles from './WalletChargePage.module.css'
import Input from '@/components/common/input/Input'
import Button from '@/components/common/button/Button'
import ResultLayout from '@/components/common/result/ResultLayout'
import { RESULT_CONFIG } from '@/shared/config/resultConfig'

import { requestTossPointCharge, confirmPointCharge } from '@/shared/api/payment/pointToss'

/* ───────────────────────── 환경변수 ───────────────────────── */
const STORE_ID = import.meta.env.VITE_PORTONE_STORE_ID?.trim()
const CHANNEL_KEY = import.meta.env.VITE_PORTONE_CHANNEL_KEY?.trim()

/* ───────────────────────── 스키마/상수 ───────────────────────── */
// 금액 유효성 스키마(최소 1,000원)
const AmountSchema = z.number().int().positive().min(1000, '최소 1,000원 이상 충전해 주세요.')

// 결과 페이지 쿼리 스키마
const ResultQuerySchema = z.object({
  type: z.literal('wallet-charge').optional(),
  paymentId: z.string().min(10).optional(),
  success: z.enum(['true', 'false']).optional(),
  code: z.string().optional(),
  message: z.string().optional(),
})

// 금액 프리셋
const AMOUNT_PRESETS = [10000, 50000, 100000, 1000000]

/* ───────────────────────── 컴포넌트 ───────────────────────── */
const WalletChargePage: React.FC = () => {
  // 입력 금액(문자열로 관리, 숫자만 허용)
  const [amount, setAmount] = useState('')
  const orderName = '지갑 포인트 충전'

  const navigate = useNavigate()
  const [params] = useSearchParams()
  const paymentIdRef = useRef<string>('')

  // 숫자 금액으로 파싱된 값
  const amountNumber = useMemo(
    () => parseInt((amount || '').replace(/[^0-9]/g, ''), 10) || 0,
    [amount],
  )

  // 결과 모드 판단을 위한 쿼리 파싱
  const resultQuery = useMemo(() => {
    const parsed = ResultQuerySchema.safeParse({
      type: params.get('type') ?? undefined,
      paymentId: params.get('paymentId') ?? undefined,
      success: params.get('success') ?? undefined,
      code: params.get('code') ?? undefined,
      message: params.get('message') ?? undefined,
    })
    return parsed.success ? parsed.data : {}
  }, [params])

  const isResultMode = resultQuery.type === 'wallet-charge'
  const shouldCheckStatus = isResultMode && !!resultQuery.paymentId

  /* ───────────────────────── 결제 상태 폴링(보조) ───────────────────────── */
  // 성공 리다이렉트 후 유효한 paymentId가 있을 때만 2초 간격으로 상태 확인
  const {
    data: paymentStatus,
    isLoading: isCheckingStatus,
    error: statusError,
  } = usePaymentStatus(resultQuery.paymentId || '', shouldCheckStatus)

  /* ───────────────────────── API Mutations ───────────────────────── */
  // 사전요청(결제 요청 등록)
  const preRequestMutation = useMutation({
    mutationFn: requestTossPointCharge,
    onSuccess: (_res, vars) => {
      console.debug('[wallet-charge] pre-request OK', vars)
    },
    onError: (err: any) => {
      console.error('[wallet-charge] pre-request ERROR', err)
      alert(`사전요청 실패: ${err?.response?.status ?? ''} ${err?.response?.data?.message ?? err?.message ?? 'Unknown error'}`)
    },
  })

  // 결제 완료(confirm)
  const confirmMutation = useMutation({
    mutationFn: confirmPointCharge,
    onSuccess: () => {
      console.debug('[wallet-charge] confirm OK')
    },
    onError: (err) => {
      console.error('[wallet-charge] confirm ERROR', err)
    },
  })

  /* ───────────────────────── 완료 트리거 ───────────────────────── */
  // 1) 성공 리다이렉트인 경우: 상태 폴링과 별개로 confirm을 1회 선호출
  useEffect(() => {
    if (isResultMode && resultQuery.paymentId) {
      if (!confirmMutation.isSuccess && !confirmMutation.isPending) {
        confirmMutation.mutate(resultQuery.paymentId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResultMode, resultQuery.paymentId])

  // 2) 상태 폴링 결과가 PAID일 때도 confirm 시도(중복 방지 체크)
  useEffect(() => {
    if (paymentStatus?.success && paymentStatus?.status === 'PAID' && resultQuery.paymentId) {
      if (!confirmMutation.isSuccess && !confirmMutation.isPending) {
        confirmMutation.mutate(resultQuery.paymentId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStatus, resultQuery.paymentId])

  /* ───────────────────────── 핸들러 ───────────────────────── */
  // PortOne에서 돌아올 리다이렉트 URL 생성
  const buildPortOneRedirect = (paymentId: string) => {
    const url = new URL('/payment/wallet-point', window.location.origin)
    url.searchParams.set('type', 'wallet-charge')
    url.searchParams.set('paymentId', paymentId)
    return url.toString()
  }

  // 보호용 네비게이션(예외 상황 대비)
  const navigateToResult = (qs: Record<string, string>) => {
    const search = new URLSearchParams(qs).toString()
    navigate({ pathname: '/payment/wallet-point', search: `?${search}` }, { replace: true })
  }

  // 프리셋 금액 버튼
  const handlePresetClick = (preset: number) => {
    const prev = parseInt((amount || '').replace(/[^0-9]/g, ''), 10) || 0
    setAmount(String(prev + preset))
  }

  // 금액 입력 핸들러(숫자만 허용)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target instanceof HTMLInputElement) {
      const val = e.target.value.replace(/[^0-9]/g, '')
      setAmount(val)
    }
  }

  // 결제 플로우 시작
  const handleCharge = async (e?: React.MouseEvent) => {
    try {
      if (e?.preventDefault) e.preventDefault()
      console.debug('[wallet-charge] handleCharge start')

      // 1) 금액 검증
      const parsed = AmountSchema.safeParse(amountNumber)
      if (!parsed.success) {
        alert(parsed.error.errors[0]?.message ?? '충전 금액을 확인해 주세요.')
        return
      }

      // 2) paymentId 생성(클라이언트 생성 방식)
      paymentIdRef.current = crypto.randomUUID()
      console.debug('[wallet-charge] paymentId', paymentIdRef.current)

      // 3) 사전요청(우리 서버에 결제 요청 등록: buyerId는 body로 포함됨)
      console.debug('[wallet-charge] pre-request → /payments/request')
      await preRequestMutation.mutateAsync({
        paymentId: paymentIdRef.current,
        amount: parsed.data,
      })

      // 4) PortOne 키 확인
      if (!STORE_ID || !CHANNEL_KEY) {
        alert('결제 설정이 올바르지 않습니다. 관리자에게 문의하세요.')
        throw new Error('Missing PortOne credentials')
      }

      // 5) PortOne 리다이렉트 URL 생성
      const successUrl = buildPortOneRedirect(paymentIdRef.current) + '&success=true'
      const failureUrl = buildPortOneRedirect(paymentIdRef.current) + '&success=false'

      // 6) PortOne SDK 호출(redirectUrl 혼용 금지: successUrl/failUrl만 사용)
      console.debug('[wallet-charge] PortOne.requestPayment', { successUrl, failureUrl })
      await PortOne.requestPayment({
        storeId: STORE_ID!,
        channelKey: CHANNEL_KEY!,
        paymentId: paymentIdRef.current,
        orderName,
        totalAmount: parsed.data,
        currency: Currency.KRW,
        payMethod: PayMethod.CARD,
        redirectUrl: buildPortOneRedirect(paymentIdRef.current),
      })

      // 7) 보호용 네비게이션(브라우저/SDK 이슈 대비)
      navigateToResult({
        type: 'wallet-charge',
        paymentId: paymentIdRef.current,
        success: 'true',
      })
    } catch (err) {
      console.error('[wallet-charge] handleCharge ERROR', err)
      navigateToResult({
        type: 'wallet-charge',
        paymentId: paymentIdRef.current || '',
        success: 'false',
      })
    }
  }

  /* ───────────────────────── 렌더 ───────────────────────── */
  if (isResultMode) {
    // 결제 상태 체크 중
    if (shouldCheckStatus && isCheckingStatus) {
      return (
        <div className="mx-auto max-w-[520px] p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">결제 확인 중…</h2>
          <p className="text-gray-600">결제 상태를 확인하고 있습니다.</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          </div>
        </div>
      )
    }

    // confirm 처리 중
    if (confirmMutation.isPending) {
      return (
        <div className="mx-auto max-w-[520px] p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">처리 중…</h2>
          <p className="text-gray-600">포인트 충전을 확정하고 있습니다.</p>
        </div>
      )
    }

    // 최종 결과 판단
    const effectiveStatus = (() => {
      if (confirmMutation.isError) return 'fail'
      if (confirmMutation.isSuccess) return 'success'
      if (statusError) return 'fail'
      if (paymentStatus?.success && paymentStatus?.status === 'PAID') return 'success'
      // 주석: 아직 확정/폴링 결과가 없으면 대기(원하면 'loading' 뷰도 가능)
      return 'pending' // 또는 'fail' 대신 대기 화면 유지
    })()

    const view = RESULT_CONFIG['wallet-charge'][effectiveStatus]
    return <ResultLayout {...view} />
  }

  // 기본 화면(금액 입력 + 충전 버튼)
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>포인트 충전하기</h1>

        <section className={styles.section}>
          <div className={styles.label}>포인트 충전 금액</div>
          <Input
            type="text"
            placeholder="금액 입력"
            value={amount}
            onChange={handleInputChange}
          />
          <div className={styles.presetGroup}>
            {AMOUNT_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={styles.presetBtn}
                onClick={() => handlePresetClick(preset)}
              >
                +{preset >= 10000 ? `${preset / 10000}${preset % 10000 === 0 ? '만' : ''}` : preset}원
              </button>
            ))}
          </div>
        </section>

        <Button
          type="button"
          className={styles.chargeBtn}
          onClick={handleCharge}
          disabled={!amountNumber || preRequestMutation.isPending}
        >
          {preRequestMutation.isPending ? '요청 중…' : '충전하기'}
        </Button>
      </div>
    </div>
  )
}

export default WalletChargePage
