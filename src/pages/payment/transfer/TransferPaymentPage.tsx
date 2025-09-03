// src/pages/payment/TransferPaymentPage.tsx 멍
// 주석: 양도 결제 페이지 — buyerId는 헤더(X-User-Id), sellerId는 쿼리/요약에서 받아 바디에 넣음 멍

import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { z } from 'zod'

import BookingProductInfo from '@/components/payment/BookingProductInfo'       // 상품(티켓) 요약 멍
import Button from '@/components/common/button/Button'                         // 공통 버튼 멍
import AlertModal from '@/components/common/modal/AlertModal'                  // 알림 모달 멍
import PasswordInputModal from '@/components/payment/modal/PasswordInputModal' // 비번 입력 모달 멍
import WalletPayment from '@/components/payment/pay/TekcitPay'                 // 킷페이(포인트 결제) 멍

import { api } from '@/shared/config/axios'                                    // axios 인스턴스 멍
import { useAuthStore } from '@/shared/storage/useAuthStore'                   // 로그인 사용자(=양수자) 멍
import { createPaymentId } from '@/models/payment/utils/paymentUtils'          // 결제ID 생성 유틸 멍
import styles from './TransferPaymentPage.module.css'                          // 스타일 멍

type Method = '킷페이'

/* ──────────────────────── 요약 API 스키마(양도자 포함) ──────────────────────── 멍 */
// 주석: sellerId(진짜 양도자)를 응답에 포함시켜 받기(쿼리에 없을 때를 대비) 멍
const TransferSummaryResponseSchema = z.object({
  transferId: z.number().int().positive(),   // 양도 ID 멍
  festivalId: z.number().int().positive(),   // 페스티벌 ID 멍
  festivalTitle: z.string().min(1),          // 페스티벌 제목 멍
  festivalDate: z.string().min(1),           // ISO 문자열 멍
  quantity: z.number().int().positive(),     // 수량 멍
  unitPrice: z.number().int().nonnegative(), // 1매 가격 멍
  currency: z.string().default('KRW'),       // 통화 멍
  sellerId: z.number().int().positive().optional(), // 양도자(없을 수도 있어 쿼리 우선) 멍
})
type TransferSummaryResponse = z.infer<typeof TransferSummaryResponseSchema>

/* ───────────────────────── 포맷 유틸 ───────────────────────── 멍 */
function formatKoreanDateTime(iso: string): string {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    const w = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
    return `${y}.${m}.${day} (${w}) ${hh}:${mm}`
  } catch {
    return iso
  }
}

const TransferPaymentPage: React.FC = () => {
  const navigate = useNavigate()
  const { search } = useLocation()

  // ✅ 쿼리 파라미터 멍
  // 예: /payment/transfer?transferId=123&bookingId=3&sellerId=10 멍
  const qs = new URLSearchParams(search)
  const transferId = qs.get('transferId')
  const bookingId = qs.get('bookingId')
  const sellerIdParam = qs.get('sellerId') // 양도자 ID가 쿼리로 넘어오는 경우 멍

  // ✅ 로그인 사용자 = 양수자(buyer) — 헤더 X-User-Id 로 사용 멍
  const user = useAuthStore((s) => s.user as any)
  const buyerId = useMemo(() => {
    const n = Number(user?.userId ?? user?.id)
    return Number.isFinite(n) && n > 0 ? n : null
  }, [user])

  // ✅ 결제ID(고정) 멍
  const paymentId = useMemo(() => createPaymentId(), [])

  // ✅ 요약 조회 멍
  const { data: summary, isLoading, isError, refetch } = useQuery({
    queryKey: ['transferSummary', transferId],
    enabled: !!transferId,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    queryFn: async (): Promise<TransferSummaryResponse> => {
      const { data } = await api.get(`/transfers/${transferId}/summary`)
      return TransferSummaryResponseSchema.parse(data)
    },
  })

  // ✅ 최종 사용할 sellerId(양도자) 결정 — 쿼리 우선, 없으면 요약 응답에서 사용 멍
  const effectiveSellerId = useMemo(() => {
    const q = Number(sellerIdParam)
    if (Number.isFinite(q) && q > 0) return q
    const s = Number(summary?.sellerId)
    if (Number.isFinite(s) && s > 0) return s
    return null
  }, [sellerIdParam, summary?.sellerId])

  // ✅ 상태 멍
  const [isAgreed, setIsAgreed] = useState(false)
  const [openedMethod, setOpenedMethod] = useState<Method | null>(null)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [isPwModalOpen, setIsPwModalOpen] = useState(false)

  // ✅ 금액/수수료 멍
  const totalAmount = useMemo(() => (summary ? summary.unitPrice * summary.quantity : 0), [summary])
  const commission = 0 // 정책 확정 시 교체 멍

  // ✅ 버튼 비활성 조건 — sellerId는 effectiveSellerId로 체크 멍
  const disabledNext = useMemo(
    () =>
      !(
        summary &&
        !isLoading &&
        !isError &&
        isAgreed &&
        openedMethod !== null &&
        buyerId &&          // 헤더용(양수자) 멍
        effectiveSellerId &&// 바디용(양도자) 멍
        bookingId
      ),
    [summary, isLoading, isError, isAgreed, openedMethod, buyerId, effectiveSellerId, bookingId]
  )

  // ✅ 결과 이동 멍
  const routeToResult = (ok: boolean, extra?: Record<string, string | undefined>) => {
    const params = new URLSearchParams({
      type: 'transfer',
      status: ok ? 'success' : 'fail',
      ...(extra ?? {}),
    })
    navigate(`/payment/result?${params.toString()}`)
  }

  // ✅ 결제수단 토글 멍
  const toggleMethod = (m: Method) => setOpenedMethod((prev) => (prev === m ? null : m))

  // ✅ /api/tekcitpay/transfer POST 멍
  // Request body: { sellerId, paymentId, bookingId, totalAmount, commission } 멍
  // Header: X-User-Id = buyerId(양수자) 멍
  const transferMutation = useMutation({
    mutationKey: ['tekcitpay-transfer', paymentId],
    mutationFn: async () => {
      const headers = buyerId ? { 'X-User-Id': String(buyerId) } : {} // 양수자 헤더 멍
      const payload = {
        sellerId: effectiveSellerId,       // 실제 양도자 멍
        paymentId,                         // 결제 식별자 멍
        bookingId: String(bookingId),      // 예약 ID 멍
        totalAmount,                       // 총액 멍
        commission,                        // 수수료 멍
      }
      return api.post('/tekcitpay/transfer', payload, { headers })
    },
  })

  // ✅ 모달 핸들러 멍
  const handleAlertConfirm = () => {
    setIsAlertOpen(false)
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const dto = buildApproveDTO()
      console.log('[approve] relation:', relation, 'dto:', dto)

      if (isFamily) {
        await respondFamily.mutateAsync(dto)
        routeToResult(true, { relation: 'FAMILY' })
      } else {
        await respondOthers.mutateAsync(dto)
        setIsPwModalOpen(true)
      }
    } catch (e: any) {
      const msg = e?.message || ''
      if (msg.includes('TRANSFER_NOT_MATCH_SENDER')) {
        alert('양도자가 일치하지 않아요. 목록에서 다시 시도해 주세요.')
      } else {
        alert('승인 처리 중 오류가 발생했어요.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleAlertCancel = () => setIsAlertOpen(false)

  // ✅ 비밀번호 입력 완료 → 결제 요청 멍
  const handlePasswordComplete = async (password: string) => {
    console.log('[KitPay] 입력 비밀번호:', password)
    setIsPwModalOpen(false)
    try {
      await transferMutation.mutateAsync()
      routeToResult(true, { txId: paymentId })
    } catch (e) {
      console.error('❌ 양도 결제 실패:', e)
      routeToResult(false, { txId: paymentId })
    }
  }

  // ✅ 오류/파라미터 가드 멍
  const showError = isError || !transferId || !bookingId || !buyerId || !effectiveSellerId
  const errorMessage =
    !transferId ? '잘못된 접근입니다. transferId가 없습니다.'
    : !bookingId ? '잘못된 접근입니다. bookingId가 없습니다.'
    : !buyerId ? '로그인이 필요합니다.'
    : !effectiveSellerId ? '양도자 정보(sellerId)를 확인할 수 없습니다.'
    : '요약 정보를 불러오지 못했습니다. 다시 시도해 주세요.'

  // ── 렌더 ──────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* 상단 헤더 멍 */}
      <header className={styles.header}>
        <h1 className={styles.title}>양도 주문서</h1>
      </header>

      {/* 오류 배너 멍 */}
      {showError && (
        <section className={styles.card}>
          <div className={styles.errorBox}>
            <p>{errorMessage}</p>
            {transferId && !isError && !summary && <Button onClick={() => refetch()}>다시 불러오기</Button>}
          </div>
        </section>
      )}

      {/* 로딩 멍 */}
      {isLoading && (
        <section className={styles.card}>
          <p>요약 정보를 불러오는 중…</p>
        </section>
      )}

      {/* 본문 멍 */}
      {summary && !isLoading && !isError && buyerId && effectiveSellerId && bookingId && (
        <>
          <div className={styles.layout}>
            <main className={styles.main}>
              {/* 상품(티켓) 정보 멍 */}
              <section className={styles.card}>
                <BookingProductInfo
                  title={summary.festivalTitle}
                  dateTimeLabel={formatKoreanDateTime(summary.festivalDate)}
                  quantity={summary.quantity}
                  unitPrice={summary.unitPrice}
                />
              </section>

              {/* 결제 수단 — 킷페이 멍 */}
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>결제 수단</h2>
                <div className={styles.paymentBox}>
                  <div className={`${styles.methodCard} ${openedMethod === '킷페이' ? styles.active : ''}`}>
                    <button
                      className={styles.methodHeader}
                      onClick={() => toggleMethod('킷페이')}
                      aria-expanded={openedMethod === '킷페이'}
                    >
                      <span className={`${styles.radio} ${openedMethod === '킷페이' ? styles.radioOn : ''}`} />
                      <span className={styles.methodText}>킷페이 (포인트 결제)</span>
                    </button>

                    {openedMethod === '킷페이' && (
                      <div className={styles.methodBody}>
                        <WalletPayment
                          isOpen
                          onToggle={() => toggleMethod('킷페이')}
                          dueAmount={summary.unitPrice * summary.quantity} // 총액 멍
                        />
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </main>

            {/* 오른쪽 요약 멍 */}
            <aside className={styles.sidebar}>
              <div className={styles.sticky}>
                <section className={`${styles.card} ${styles.summaryCard}`} aria-label="결제 요약">
                  <h2 className={styles.cardTitle}>결제 요약</h2>

                  <div className={styles.priceRow}>
                    <span>티켓 1매 가격</span>
                    <span className={styles.priceValue}>{summary.unitPrice.toLocaleString()}원</span>
                  </div>

                  <div className={styles.priceRow}>
                    <span>수량</span>
                    <span className={styles.priceValue}>{summary.quantity.toLocaleString()}매</span>
                  </div>

                  <div className={styles.divider} />

                  <div className={styles.priceTotal} aria-live="polite">
                    <strong>총 결제 금액</strong>
                    <strong className={styles.priceStrong}>
                      {(summary.unitPrice * summary.quantity).toLocaleString()}원
                    </strong>
                  </div>

                  {/* 약관 동의 멍 */}
                  <label className={styles.agree}>
                    <input
                      type="checkbox"
                      checked={isAgreed}
                      onChange={(e) => setIsAgreed(e.target.checked)}
                      aria-label="양도 서비스 약관 동의"
                    />
                    <span>(필수) 양도 서비스 이용약관 및 개인정보 수집·이용에 동의합니다.</span>
                  </label>

                  <Button
                    disabled={disabledNext || transferMutation.isPending}
                    className={styles.nextBtn}
                    aria-disabled={disabledNext || transferMutation.isPending}
                    aria-label="다음 단계로 이동"
                    onClick={() => setIsAlertOpen(true)}
                  >
                    {transferMutation.isPending ? '처리 중…' : '다음'}
                  </Button>
                </section>
              </div>
            </aside>
          </div>

          {/* 모달들 멍 */}
          {isAlertOpen && (
            <AlertModal title="결제 안내" onCancel={() => setIsAlertOpen(false)} onConfirm={handleAlertConfirm}>
              양도로 구매한 티켓은 환불 불가합니다. 계속 진행하시겠습니까?
            </AlertModal>
          )}

          {isPwModalOpen && (
            <PasswordInputModal
              onClose={() => setIsPwModalOpen(false)}
              onComplete={handlePasswordComplete}
            />
          )}
        </>
      )}
    </div>
  )
}

export default TransferPaymentPage
