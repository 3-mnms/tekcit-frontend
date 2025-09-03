// src/pages/payment/wallet/WalletChargePage.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import PortOne, { Currency, PayMethod } from '@portone/browser-sdk/v2'

import styles from './WalletChargePage.module.css'
import Input from '@/components/common/input/Input'
import Button from '@/components/common/button/Button'
import ResultLayout from '@/components/common/result/ResultLayout'
import { RESULT_CONFIG } from '@/shared/config/resultConfig'

// 수정된 API 임포트
import {
  requestTossPointCharge,
  confirmPointCharge,
} from '@/shared/api/payment/pointToss'

/* ───────────────────────── 환경변수 ───────────────────────── */
const STORE_ID = import.meta.env.VITE_PORTONE_STORE_ID?.trim()
const CHANNEL_KEY = import.meta.env.VITE_PORTONE_CHANNEL_KEY?.trim()

/* ───────────────────────── 스키마/상수 ───────────────────────── */
const AmountSchema = z.number().int().positive().min(1000, '최소 1,000원 이상 충전해 주세요.')

const ResultQuerySchema = z.object({
  type: z.literal('wallet-charge').optional(),
  paymentId: z.string().min(10).optional(),
  success: z.enum(['true', 'false']).optional(),
  code: z.string().optional(),
  message: z.string().optional(),
})

const AMOUNT_PRESETS = [10000, 50000, 100000, 1000000]

/* ───────────────────────── 컴포넌트 ───────────────────────── */
const WalletChargePage: React.FC = () => {
  const [amount, setAmount] = useState('')
  const orderName = '지갑 포인트 충전'
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const paymentIdRef = useRef<string>('')

  const amountNumber = useMemo(
    () => parseInt((amount || '').replace(/[^0-9]/g, ''), 10) || 0,
    [amount],
  )

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
  const shouldConfirm =
    isResultMode &&
    resultQuery.success === 'true' &&
    !!resultQuery.paymentId

  /* ───────────────────────── API Mutations ───────────────────────── */
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

  const confirmMutation = useMutation({
    mutationFn: confirmPointCharge,
    onSuccess: () => {
      console.debug('[wallet-charge] confirm OK')
    },
    onError: (err) => {
      console.error('[wallet-charge] confirm ERROR', err)
    },
  })

  useEffect(() => {
    if (shouldConfirm) {
      confirmMutation.mutate(resultQuery.paymentId!)
    }
  }, [shouldConfirm])

  /* ───────────────────────── 핸들러 ───────────────────────── */
  const buildPortOneRedirect = (paymentId: string) => {
    const url = new URL('/payment/wallet-point', window.location.origin)
    url.searchParams.set('type', 'wallet-charge')
    url.searchParams.set('paymentId', paymentId)
    return url.toString()
  }

  const navigateToResult = (qs: Record<string, string>) => {
    const search = new URLSearchParams(qs).toString()
    navigate({ pathname: '/payment/wallet-point', search: `?${search}` }, { replace: true })
  }

  const handlePresetClick = (preset: number) => {
    const prev = parseInt((amount || '').replace(/[^0-9]/g, ''), 10) || 0
    setAmount(String(prev + preset))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target instanceof HTMLInputElement) {
      const val = e.target.value.replace(/[^0-9]/g, '')
      setAmount(val)
    }
  }

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

      // 2) paymentId 생성
      paymentIdRef.current = crypto.randomUUID()
      console.debug('[wallet-charge] paymentId', paymentIdRef.current)

      // 3) 사전요청
      console.debug('[wallet-charge] pre-request → /payments/request')
      await preRequestMutation.mutateAsync({
        paymentId: paymentIdRef.current,
        amount: parsed.data,
      })

      // 4) PortOne 키 체크
      if (!STORE_ID || !CHANNEL_KEY) {
        alert('결제 설정이 올바르지 않습니다. 관리자에게 문의하세요.')
        throw new Error('Missing PortOne credentials')
      }

      // 5) PortOne redirectUrl 생성
      const redirectUrl = buildPortOneRedirect(paymentIdRef.current)

      // 6) PortOne SDK 호출
      console.debug('[wallet-charge] PortOne.requestPayment', { redirectUrl })
      await PortOne.requestPayment({
        storeId: STORE_ID!,
        channelKey: CHANNEL_KEY!,
        paymentId: paymentIdRef.current,
        orderName,
        totalAmount: parsed.data,
        currency: Currency.KRW,
        payMethod: PayMethod.CARD,
        redirectUrl,
      })

      // 7) 보호용 네비게이션
      navigateToResult({ type: 'wallet-charge', paymentId: paymentIdRef.current })
    } catch (err) {
      console.error('[wallet-charge] handleCharge ERROR', err)
      navigateToResult({ type: 'wallet-charge', success: 'false' })
    }
  }

  /* ───────────────────────── 렌더 ───────────────────────── */
  if (isResultMode) {
    if (resultQuery.success === 'true' && confirmMutation.isPending) {
      return (
        <div className="mx-auto max-w-[520px] p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">처리 중…</h2>
          <p className="text-gray-600">포인트 충전을 확정하고 있습니다.</p>
        </div>
      )
    }

    const effectiveStatus =
      resultQuery.success === 'true'
        ? (confirmMutation.isError ? 'fail' : 'success')
        : 'fail'

    const view = RESULT_CONFIG['wallet-charge'][effectiveStatus]
    return <ResultLayout {...view} />
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>포인트 충전하기</h1>

        <section className={styles.section}>
          <div className={styles.label}>포인트 충전 금액</div>
          <Input type="text" placeholder="금액 입력" value={amount} onChange={handleInputChange} />
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