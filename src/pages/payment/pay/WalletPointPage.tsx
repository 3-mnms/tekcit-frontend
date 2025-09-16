// WalletPointPage.tsx
import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
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

  const parsed = useMemo(() =>
    ResultQuerySchema.safeParse({
      type: params.get('type') ?? undefined,
      paymentId: params.get('paymentId') ?? undefined,
      success: params.get('success') ?? undefined,
    }), [params]
  )
  const qs = parsed.success ? parsed.data : {}

  useEffect(() => {
    if (qs.type === 'wallet-charge' && qs.success === 'false') {
      alert('결제가 완료되지 않았습니다.')
      window.location.replace('/payment/wallet-point')
    }
  }, [qs.type, qs.success])

  const confirmMutation = useMutation({
    mutationFn: (pid: string) => confirmPointCharge(pid, userId),
  })

  const pollRef = useRef<number | null>(null)
  const shouldConfirm = qs.type === 'wallet-charge' && !!qs.paymentId && qs.success === 'true'

  // ✅ 폴링 로직 최적화 - cleanup 개선
  useEffect(() => {
    if (!shouldConfirm || !userId) {
      // 조건 불만족시 기존 폴링 정리
      if (pollRef.current != null) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
      return
    }

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
  }, [shouldConfirm, userId, qs.paymentId, confirmMutation])

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

  // ✅ 월 초기값을 함수로 계산하지 않고 상수로 처리
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [page, setPage] = useState(0)

  useChargeResultHandler()

  const { data: balanceData, isLoading: isBalanceLoading, refetch: refetchBalance } = useWalletBalance()
  const { data: historyPage, isLoading: isHistoryLoading, error: historyError, refetch: refetchHistory } =
    useWalletHistory({ page, size: PAGE_SIZE })

  // ✅ 이벤트 리스너 최적화 - useCallback과 throttle 적용
  const sync = useCallback(() => {
    refetchBalance()
    refetchHistory()
  }, [refetchBalance, refetchHistory])

  // ✅ 이벤트 리스너 throttle 적용
  const throttledSync = useMemo(() => {
    let timeoutId: number | null = null
    return () => {
      if (timeoutId) return
      timeoutId = window.setTimeout(() => {
        sync()
        timeoutId = null
      }, 1000) // 1초 throttle
    }
  }, [sync])

  useEffect(() => {
    window.addEventListener('focus', throttledSync)
    document.addEventListener('visibilitychange', throttledSync)
    return () => {
      window.removeEventListener('focus', throttledSync)
      document.removeEventListener('visibilitychange', throttledSync)
    }
  }, [throttledSync])

  // ✅ 월별 필터링 복원 - 백엔드에 월 파라미터가 없으므로 프론트에서 필터링
  const filteredItems = useMemo(() => {
    const content = historyPage?.content ?? []

    // 선택된 월과 일치하는 데이터만 필터링
    return content.filter((row: any) => {
      const timeField = row.time ?? row.payTime ?? row.createdAt
      if (!timeField) return false

      const itemDate = new Date(timeField)
      const itemMonth = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`
      return itemMonth === month
    })
  }, [historyPage?.content, month])

  // ✅ 수정된 viewItems 생성 로직
  const viewItems: WalletHistoryViewItem[] = useMemo(() => {
    return filteredItems.map((row: any, idx: number) => {
      const payMethod = row.payMethod || row.method || ''
      const transactionType = row.transactionType || ''
      const paymentStatus = row.paymentStatus || ''

      // ✅ 올바른 타입 결정 로직 - transfer는 모두 사용으로 처리
      const determineType = (method: string, txType: string, status: string): 'charge' | 'refund' | 'use' => {
        // 🔥 transactionType 기반 판단이 최우선
        if (txType === 'CREDIT') {
          // 입금: 충전 또는 양도 수취
          if (method === 'POINT_CHARGE') {
            return 'charge'  // 포인트 충전
          } else if (method === 'POINT_PAYMENT') {
            return 'charge'  // 양도 대금 수취 (POINT_PAYMENT + CREDIT)
          } else {
            return 'charge'  // 기타 입금 (환불 등)
          }
        } else if (txType === 'DEBIT') {
          // 출금: 사용 (결제, 양도 지불, 수수료 등)
          return 'use'
        }

        // transactionType이 없는 경우 기존 로직 (레거시 지원)
        if (method === 'POINT_CHARGE') {
          return 'charge'
        }

        if (method === 'POINT_PAYMENT') {
          return 'use'
        }

        // transfer 관련 레거시 처리
        if (status?.includes('TRANSFER') || method?.includes('TRANSFER')) {
          return 'use'
        }

        // 기본값
        return 'use'
      }

      const type = determineType(payMethod, transactionType, paymentStatus)

      return {
        id: String(row.paymentId ?? `tx-${page}-${idx}`),
        createdAt: String(row.time ?? row.payTime ?? row.createdAt ?? new Date().toISOString()),
        type,
        amount: Math.abs(Number(row.amount ?? 0)),
        paymentStatus,
        transactionType,
        payMethod,
        currency: row.currency || 'KRW',
      }
    })
  }, [filteredItems, page])

  // 월 변경시 페이지 초기화 추가
  const handleMonthChange = useCallback((newMonth: string) => {
    setMonth(newMonth)
    setPage(0) // 월 변경시 첫 페이지로 이동
  }, [])

  // 포맷 함수들을 useCallback으로 메모화
  const fmt = useCallback((n: number) => n.toLocaleString('ko-KR'), [])
  const handleChargeClick = useCallback(() => navigate('/payment/wallet-point/money-charge'), [navigate])

  // ✅ 월 옵션 생성을 상수로 이동 (컴포넌트 외부)
  const monthOptions = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = `${d.getMonth() + 1}월`
      return { value, label }
    })
  }, [])

  // ✅ 페이지 변경 핸들러 추가 (누락된 함수)
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  // ✅ 지난달 보기 핸들러 최적화
  const handlePrevMonthClick = useCallback(() => {
    const d = new Date(`${month}-01`)
    d.setMonth(d.getMonth() - 1)
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    setPage(0)
  }, [month])

  // ✅ 에러 메시지 메모화
  const errorMessage = useMemo(() =>
    historyError ? '내역을 불러오지 못했어요 (서버 오류)' : null,
    [historyError]
  )

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
              {isBalanceLoading ?
                <span className={styles.skeleton} /> :
                `${fmt(balanceData?.availableBalance ?? 0)}원`
              }
            </div>
          </div>
          <div className={styles.summaryRight}>
            <Button className={styles.chargeBtn} onClick={handleChargeClick}>충전</Button>
          </div>
        </section>

        <div className={styles.filterBar}>
          <div className={styles.dropdownWrap}>
            <MonthDropdown
              value={month}
              onChange={handleMonthChange}
              months={6}
              placeholder="월 선택"
            />
          </div>

          {/* ✅ 현재 선택된 월 표시 추가 */}
          <div className={styles.currentMonth}>
            {new Date(`${month}-01`).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long'
            })} 내역
          </div>

          <div className={styles.pager} role="navigation" aria-label="페이지 이동">
            <button
              className={styles.pagerBtn}
              disabled={!historyPage || historyPage.first}
              onClick={() => handlePageChange(Math.max(0, page - 1))}
              aria-label="이전 페이지"
            >
              ‹
            </button>

            <span className={styles.pageInfo}>
              <b>{(historyPage?.number ?? 0) + 1}</b>
              <span className={styles.sep}> / </span>
              {Math.max(1, historyPage?.totalPages ?? 1)}
            </span>

            <button
              className={styles.pagerBtn}
              disabled={!historyPage || historyPage.last}
              onClick={() => handlePageChange(page + 1)}
              aria-label="다음 페이지"
            >
              ›
            </button>
          </div>
        </div>

        <section className={styles.historySection}>
          <WalletHistory
            month={month}
            items={viewItems}
            loading={isHistoryLoading}
            error={errorMessage}
          />
          {!isHistoryLoading && viewItems.length === 0 && (
            <div className={styles.emptyAction}>
              <Button onClick={handlePrevMonthClick}>지난달 내역 보기</Button>
            </div>
          )}
        </section>
      </div>
    </>
  )
}