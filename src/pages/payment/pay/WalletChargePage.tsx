// WalletChargePage.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import PortOne, { Currency, PayMethod } from '@portone/browser-sdk/v2'

import styles from './WalletChargePage.module.css'
import Input from '@/components/common/input/Input'
import Button from '@/components/common/button/Button'
import Header from '@/components/common/header/Header'

import { requestTossPointCharge, type PointChargeRequest } from '@/shared/api/payment/pointToss'
import { useTokenInfoQuery } from '@/shared/api/useTokenInfoQuery'
import { getEnv } from '@/shared/config/env'

const STORE_ID = getEnv("VITE_PORTONE_STORE_ID")
const CHANNEL_KEY = getEnv("VITE_PORTONE_CHANNEL_KEY")

const AmountSchema = z.number().int().positive().min(1000, '최소 1,000원 이상 충전해 주세요.')
const AMOUNT_PRESETS = [10000, 50000, 100000, 1000000]

const WalletChargePage: React.FC = () => {

  // 입력 금액(문자열로 관리, 숫자만 허용)
  const [amount, setAmount] = useState('')
  const orderName = '지갑 포인트 충전'

  const navigate = useNavigate()
  const paymentIdRef = useRef<string>('')

  const { data: tokenInfo } = useTokenInfoQuery()
  const userId = tokenInfo?.userId

  useEffect(() => {
    if (!STORE_ID || !CHANNEL_KEY) {
      alert('포트원 키가 없습니다')
    }
  }, [])

  const amountNumber = useMemo(
    () => parseInt((amount || '').replace(/[^0-9]/g, ''), 10) || 0,
    [amount],
  )

  const preRequestMutation = useMutation({
    mutationFn: (vars: { input: PointChargeRequest; userId: number }) =>
      requestTossPointCharge(vars.input, vars.userId),
  })

  const buildPortOneRedirect = (paymentId: string) => {
    const url = new URL('/payment/wallet-point', window.location.origin)
    url.searchParams.set('type', 'wallet-charge')
    url.searchParams.set('paymentId', paymentId)
    url.searchParams.set('success', 'true') // 유지
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
    if (e?.preventDefault) e.preventDefault()
    try {
      if (!userId) {
        alert('로그인이 필요합니다.')
        return
      }

      const parsed = AmountSchema.safeParse(amountNumber)
      if (!parsed.success) {
        alert(parsed.error.errors[0]?.message ?? '충전 금액을 확인해 주세요.')
        return
      }

      paymentIdRef.current =
        (crypto as any)?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`

      await preRequestMutation.mutateAsync({
        input: { paymentId: paymentIdRef.current, amount: parsed.data },
        userId,
      })

      if (!STORE_ID || !CHANNEL_KEY) {
        alert('결제 설정이 올바르지 않습니다. 관리자에게 문의하세요.')
        navigateToResult({ type: 'wallet-charge', success: 'false' })
        return
      }

      const redirectUrl = buildPortOneRedirect(paymentIdRef.current)

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

      // 결제 직후 결과 페이지로 선 이동 (유지)
      navigateToResult({
        type: 'wallet-charge',
        paymentId: paymentIdRef.current,
        success: 'true',
      })
    } catch (_err) {
      navigateToResult({ type: 'wallet-charge', success: 'false' })
    }
  }

  const disabled = !amountNumber || preRequestMutation.isPending
  // 주석: 아래 return 내부만 교체. 상단 import/상수/훅/핸들러/뮤테이션 등 기존 로직은 유지하세요.
  return (
    <>
      {/* 주석: 공용 헤더는 그대로 */}
      <Header />

      {/* 주석: 히어로 + 카드 래아웃 */}
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <h1 className={styles.title}>포인트 충전하기</h1>
          <p className={styles.subtitle}>원하는 금액을 선택하거나 직접 입력해주세요</p>

          {/* 주석: 금액 입력 섹션 */}
          <section className={styles.section} aria-labelledby="charge-section">
            <div id="charge-section" className={styles.label}>
              포인트 충전 금액
            </div>

            <Input
              type="text"
              inputMode="numeric"
              placeholder="금액 입력"
              value={amount}
              onChange={handleInputChange}
              aria-label="충전 금액"
              className={styles.amountInput}
            />

            {/* 주석: 2×2 프리셋 버튼 */}
            <div className={styles.presetGroup}>
              {AMOUNT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={styles.presetBtn}
                  onClick={() => handlePresetClick(preset)}
                  aria-label={`+${preset.toLocaleString('ko-KR')}원`}
                >
                  {preset >= 10000
                    ? `+${preset / 10000}${preset % 10000 === 0 ? '만' : ''}원`
                    : `+${preset}원`}
                </button>
              ))}
            </div>
          </section>

          {/* 주석: CTA */}
          <Button
            type="button"
            className={styles.chargeBtn}
            onClick={handleCharge}
            disabled={disabled}
            aria-disabled={disabled}
          >
            {preRequestMutation.isPending ? '요청 중…' : '충전하기'}
          </Button>

          {/* 주석: 보조 텍스트(금액 미리보기) */}
          <div className={styles.helperText} aria-live="polite">
            {amountNumber > 0 ? `충전 예정 금액: ${amountNumber.toLocaleString('ko-KR')}원` : '\u00A0'}
          </div>
        </div>
      </div>
    </>
  )
}

export default WalletChargePage
