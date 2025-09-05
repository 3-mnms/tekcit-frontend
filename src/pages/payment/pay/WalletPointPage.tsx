// WalletPointPage.tsx
// 주석: 내역은 서버에서 page/size만 받아오고, 월 필터는 프론트에서 처리 멍
import { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import Button from '@/components/common/button/Button'
import WalletHistory, { type WalletHistoryViewItem } from '@/components/payment/pay/WalletHistory'
import { useWalletBalance, useWalletHistory } from '@/shared/api/payment/tekcitHistory'
import { confirmPointCharge } from '@/shared/api/payment/pointToss'
import { useTokenInfoQuery } from '@/shared/api/useTokenInfoQuery'
import styles from './WalletPointPage.module.css'

const PAGE_SIZE = 10

/* ───────────────────────── 결과 처리(확정/알림/새로고침) 멍 ───────────────────────── */
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

  // 실패로 돌아온 경우: 바로 안내 후 쿼리 제거되도록 새로고침 이동
  useEffect(() => {
    if (qs.type === 'wallet-charge' && qs.success === 'false') {
      alert('결제가 완료되지 않았습니다.')
      window.location.replace('/payment/wallet-point')
    }
  }, [qs.type, qs.success])

  // 확정 호출 (X-User-Id 필요 시 헤더 포함 — pointToss.ts 참고)
  const confirmMutation = useMutation({
    mutationFn: (pid: string) => confirmPointCharge(pid, userId),
  })

  // 승인 지연 대비 2초 폴링 (userId 준비 후 시작)
  const pollRef = useRef<number | null>(null)
  const shouldConfirm =
    qs.type === 'wallet-charge' && !!qs.paymentId && qs.success === 'true'

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

  // 성공 시: 알림 → 새로고침 이동 (쿼리 제거)
  const redirectedRef = useRef(false)
  useEffect(() => {
    if (shouldConfirm && confirmMutation.isSuccess && !redirectedRef.current) {
      redirectedRef.current = true
      alert('충전이 완료되었습니다.')
      window.location.replace('/payment/wallet-point')
    }
  }, [shouldConfirm, confirmMutation.isSuccess])
}
/* ──────────────────────────────────────────────────────────────────────── */

export default function WalletPointPage() {
  const navigate = useNavigate()
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [page, setPage] = useState(0)

  // ✅ 결제 결과 처리 훅 실행 (쿼리로 돌아오면 여기서 확정/알림/새로고침)
  useChargeResultHandler()

  const { data: balanceData, isLoading: isBalanceLoading, refetch: refetchBalance } = useWalletBalance()
  const { data: historyPage, isLoading: isHistoryLoading, error: historyError, refetch: refetchHistory } =
    useWalletHistory({ page, size: PAGE_SIZE })

  useEffect(() => {
    const sync = () => { refetchBalance(); refetchHistory() }
    window.addEventListener('focus', sync)
    document.addEventListener('visibilitychange', sync)
    return () => { window.removeEventListener('focus', sync); document.removeEventListener('visibilitychange', sync) }
  }, [refetchBalance, refetchHistory])

  // 주석: 월 필터(YYYY-MM) — 서버에서 받은 content를 프론트에서 필터링 멍
  const filteredItems = useMemo(() => {
    const toYM = (isoLike: unknown) => {
      const d = new Date(String(isoLike ?? ''))
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    }
    const list = historyPage?.content ?? []
    // ✅ 서버가 payTime 또는 time을 줄 수 있으므로 둘 다 대응
    return list.filter((it: any) => toYM(it.payTime ?? it.time) === month)
  }, [historyPage, month])

  // 주석: 뷰모델 변환 멍
  const viewItems: WalletHistoryViewItem[] = useMemo(() => {
    return filteredItems.map((row: any, idx: number) => {
      // ✅ 서버가 payMethod 또는 method를 줄 수 있으므로 둘 다 대응
      const rawMethod = String(row.payMethod ?? row.method ?? '').toUpperCase()

      // ✅ 규칙: payMethod에 'CHARGE'가 포함되면 충전(+), 아니면 사용(-)
      // (REFUND가 들어오면 보너스로 환불(+) 처리)
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

  return (
    <div className={styles.container}>
      {/* 상단 타이틀 바 */}
      <div className={styles.topbar}><h1 className={styles.pageTitle}>킷페이 내역</h1></div>

      {/* 잔액 카드 */}
      <section className={styles.summaryCard}>
        <div className={styles.summaryLeft}>
          <div className={styles.summaryLabel}>현재 잔액</div>
          <div className={styles.summaryValue}>
            {isBalanceLoading ? <span className={styles.skeleton} /> : `${fmt(balanceData?.availableBalance ?? 0)}원`}
          </div>
        </div>
        <div className={styles.summaryRight}>
          <Button className={styles.chargeBtn} onClick={handleChargeClick}>충전</Button>
        </div>
      </section>

      {/* 월 선택 + 페이지 이동 */}
      <div className={styles.filterBar}>
        <select
          className={styles.monthSelect}
          value={month}
          onChange={(e) => { setMonth(e.target.value); /* 주석: 서버 페이지는 그대로 유지해도 OK 멍 */ }}
        >
          {Array.from({ length: 6 }).map((_, i) => {
            const d = new Date(); d.setMonth(d.getMonth() - i)
            const v = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            return <option key={v} value={v}>{d.getMonth() + 1}월</option>
          })}
        </select>

        <div className={styles.pager}>
          <button className={styles.pagerBtn} disabled={!historyPage || historyPage.first} onClick={() => setPage(p => Math.max(0, p - 1))}>이전</button>
          <span className={styles.pageInfo}>{(historyPage?.number ?? 0) + 1} / {Math.max(1, historyPage?.totalPages ?? 1)}</span>
          <button className={styles.pagerBtn} disabled={!historyPage || historyPage.last} onClick={() => setPage(p => p + 1)}>다음</button>
        </div>
      </div>

      {/* 내역 표시 */}
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
  )
}
