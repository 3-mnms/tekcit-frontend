
// WalletPointPage.tsx
import { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import Button from '@/components/common/button/Button'
import WalletHistory, { type WalletHistoryViewItem } from '@/components/payment/pay/WalletHistory'
import { useWalletBalance, useWalletHistory } from '@/shared/api/payment/tekcitHistory'
import Header from '@/components/common/header/Header'
import { confirmPointCharge } from '@/shared/api/payment/pointToss'
import { useTokenInfoQuery } from '@/shared/api/useTokenInfoQuery'
import MonthDropdown from '@/components/payment/dropdown/MonthDropdown'
import { FaRegCreditCard } from 'react-icons/fa'
import styles from './WalletPointPage.module.css'

const PAGE_SIZE = 10

const ResultQuerySchema = z.object({
  type: z.literal('wallet-charge').optional(),
  paymentId: z.string().min(10).optional(),
  success: z.enum(['true', 'false']).optional(),
})

function useChargeResultHandler() {
  const [params] = useSearchParams()
  const { data: tokenInfo } = useTokenInfoQuery()
  const userId = tokenInfo?.userId

  const parsed = ResultQuerySchema.safeParse({
    type: params.get('type') ?? undefined,
    paymentId: params.get('paymentId') ?? undefined,
    success: params.get('success') ?? undefined,
  })
  const qs = parsed.success ? parsed.data : {}

  useEffect(() => {
    if (qs.type === 'wallet-charge' && qs.success === 'false') {
      alert('결제가 완료되지 않았습니다.')
      window.location.replace('/payment/wallet-point')
    }
  }, [qs.type, qs.success])

  const confirmMutation = useMutation({
    mutationFn: (pid: string) => confirmPointCharge(pid, userId), // 주석: 서버 확정 호출 멍
  })

  const pollRef = useRef<number | null>(null)
  const shouldConfirm = qs.type === 'wallet-charge' && !!qs.paymentId && qs.success === 'true'

  useEffect(() => {
    if (!shouldConfirm || !userId) return

    if (!confirmMutation.isPending && !confirmMutation.isSuccess) {
      confirmMutation.mutate(qs.paymentId!)
    }

    if (pollRef.current == null) {
      pollRef.current = window.setInterval(() => {
        if (!confirmMutation.isSuccess && !confirmMutation.isPending) {
          confirmMutation.mutate(qs.paymentId!)
        }
      }, 2000)
    }

    return () => {
      if (pollRef.current != null) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [shouldConfirm, userId, qs.paymentId, confirmMutation.isPending, confirmMutation.isSuccess])

  const redirectedRef = useRef(false)
  useEffect(() => {
    if (shouldConfirm && confirmMutation.isSuccess && !redirectedRef.current) {
      redirectedRef.current = true
      alert('충전이 완료되었습니다.')
      window.location.replace('/payment/wallet-point')
    }
  }, [shouldConfirm, confirmMutation.isSuccess])
}

export default function WalletPointPage() {
  const navigate = useNavigate()
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` // 주석: 초기값 현재 YYYY-MM 멍
  })
  const [page, setPage] = useState(0)

  useChargeResultHandler()

  const { data: balanceData, isLoading: isBalanceLoading, refetch: refetchBalance } = useWalletBalance()
  const { data: historyPage, isLoading: isHistoryLoading, error: historyError, refetch: refetchHistory } =
    useWalletHistory({ page, size: PAGE_SIZE })

  useEffect(() => {
    const sync = () => { refetchBalance(); refetchHistory() } // 주석: 포커스/가시성 변경 시 동기화 멍
    window.addEventListener('focus', sync)
    document.addEventListener('visibilitychange', sync)
    return () => { window.removeEventListener('focus', sync); document.removeEventListener('visibilitychange', sync) }
  }, [refetchBalance, refetchHistory])

  const filteredItems = useMemo(() => {
    const toYM = (isoLike: unknown) => {
      const d = new Date(String(isoLike ?? ''))
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    }
    const list = historyPage?.content ?? []
    return list.filter((it: any) => toYM(it.payTime ?? it.time) === month) // 주석: 월 필터링 멍
  }, [historyPage, month])

  const viewItems: WalletHistoryViewItem[] = useMemo(() => {
    return filteredItems.map((row: any, idx: number) => {
      const rawMethod = String(row.payMethod ?? row.method ?? '').toUpperCase()
      const type: 'charge' | 'refund' | 'use' =
        rawMethod.includes('CHARGE') ? 'charge'
          : rawMethod.includes('REFUND') ? 'refund'
            : 'use'
      return {
        id: String(row.paymentId ?? row.id ?? `tx-${page}-${idx}`),
        createdAt: String(row.payTime ?? row.time ?? new Date().toISOString()),
        type,
        amount: Math.abs(Number(row.amount ?? 0)),
      }
    })
  }, [filteredItems, page])

  const fmt = (n: number) => n.toLocaleString('ko-KR')
  const handleChargeClick = () => navigate('/payment/wallet-point/money-charge')

  // 주석: 최근 6개월 옵션 생성(현재 월부터 과거로) 멍
  const monthOptions = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = `${d.getMonth() + 1}월`
      return { value, label }
    })
  }, [])

  return (
    <>
      <Header />
      <div className={styles.container}>
        <section className={styles.summaryCard}>
          <div className={styles.summaryLeft}>
            <div className={styles.summaryLabelRow}>
              <FaRegCreditCard className={styles.labelIcon} aria-hidden />
              <span className={styles.summaryLabel}>현재 잔액</span>
            </div>
            <div className={styles.summaryValue}>
              {isBalanceLoading ? <span className={styles.skeleton} /> : `${fmt(balanceData?.availableBalance ?? 0)}원`}
            </div>
          </div>
          <div className={styles.summaryRight}>
            <Button className={styles.chargeBtn} onClick={handleChargeClick}>충전</Button>
          </div>
        </section>

        {/* 주석: 월 선택 + 페이지 이동 영역 멍 */}
        <div className={styles.filterBar}>
          {/* ✅ 커스텀 드롭다운 적용 */}
          <div className={styles.dropdownWrap /* 주석: 필요 시 페이지 CSS에 간단 래퍼 추가 가능 멍 */}>
            <MonthDropdown
              value={month}                // 주석: 선택된 YYYY-MM 멍
              onChange={(v) => {          // 주석: 변경 시 상태 갱신(서버 페이징은 그대로) 멍
                setMonth(v)
              }}
              options={monthOptions}      // 주석: 최근 6개월 옵션 멍
              placeholder="월 선택"
            />
          </div>

          {/* 주석: 페이저 멍 */}
          <div className={styles.pager} role="navigation" aria-label="페이지 이동">
            <button
              className={styles.pagerBtn}
              disabled={!historyPage || historyPage.first}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              aria-label="이전 페이지"
            >
              ‹{/* 주석: 왼쪽 화살표 멍 */}
            </button>

            <span className={styles.pageInfo}>
              <b>{(historyPage?.number ?? 0) + 1}</b>
              <span className={styles.sep}> / </span>
              {Math.max(1, historyPage?.totalPages ?? 1)}
            </span>

            <button
              className={styles.pagerBtn}
              disabled={!historyPage || historyPage.last}
              onClick={() => setPage(p => p + 1)}
              aria-label="다음 페이지"
            >
              ›{/* 주석: 오른쪽 화살표 멍 */}
            </button>
          </div>
        </div>

        {/* 주석: 내역 표시 멍 */}
        <section className={styles.historySection}>
          <WalletHistory
            month={month}
            items={viewItems}
            loading={isHistoryLoading}
            error={historyError ? '내역을 불러오지 못했어요 (서버 오류)' : null}
          />
          <div className={styles.emptyAction}>
            <Button onClick={() => {
              const d = new Date(`${month}-01`); d.setMonth(d.getMonth() - 1)
              setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
            }}>지난달 내역 보기</Button>
          </div>
        </section>
      </div>
    </>
  )
}
