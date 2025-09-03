// src/pages/payment/BookingPaymentPage.tsx
// 주석: 예매 결제 페이지 — Tekcit API(request → tekcitpay → complete) 연동 버전

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'

import type { TossPaymentHandle } from '@/components/payment/pay/TossPayment'
import PaymentInfo from '@/components/payment/pay/PaymentInfo'
import BookingPaymentHeader from '@/components/payment/pay/BookingPaymentHeader'
import ReceiveInfo from '@/components/payment/delivery/ReceiveInfo'

import Button from '@/components/common/button/Button'
import PasswordInputModal from '@/components/payment/modal/PasswordInputModal'
import AlertModal from '@/components/common/modal/AlertModal'

import { useAuthStore } from '@/shared/storage/useAuthStore'
import PaymentSection from '@/components/payment/pay/PaymentSection'
import type { CheckoutState, PaymentMethod } from '@/models/payment/types/paymentTypes'
import { createPaymentId } from '@/models/payment/utils/paymentUtils'
import { saveBookingSession } from '@/shared/api/payment/paymentSession'
import { fetchBookingDetail } from '@/shared/api/payment/bookingDetail'
import {
  requestTekcitPayment,     // 1단계 — 결제 요청
  verifyTekcitPassword,      // 2단계 — 지갑 비번 검증+차감 (자동 재시도 포함)
  confirmTekcitPayment,      // 3단계 — 결제 완료
  getUserIdForHeader,
} from '@/shared/api/payment/tekcit'

import styles from './BookingPaymentPage.module.css'

/* JWT에서 name 꺼내기(스토어에 없을 때 폴백) */
function getNameFromJwt(): string | undefined {
  try {
    const raw = localStorage.getItem('accessToken') || ''
    const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw
    if (!token) return undefined
    const part = token.split('.')[1] ?? ''
    const safe = part.replace(/-/g, '+').replace(/_/g, '/')
    const padded = safe + '='.repeat((4 - (safe.length % 4)) % 4)
    const payload = JSON.parse(atob(padded))
    const name = payload?.name
    return typeof name === 'string' && name.trim() ? name.trim() : undefined
  } catch {
    return undefined
  }
}

// 결제 제한 시간(초)
const DEADLINE_SECONDS = 5 * 60

const BookingPaymentPage: React.FC = () => {
  /* ───────────────────────── 라우터/상태 기본 ───────────────────────── */
  const navigate = useNavigate()
  const { state } = useLocation()
  const checkout = state as CheckoutState

  /* 결제 금액/주문명/공연ID 파생값 */
  const unitPrice = checkout?.unitPrice ?? 0
  const quantity = checkout?.quantity ?? 0
  const finalAmount = useMemo(() => unitPrice * quantity, [unitPrice, quantity])
  const orderName = useMemo(() => checkout?.title, [checkout?.title])
  const festivalIdVal = checkout?.festivalId

  /* 사용자/판매자 정보 */
  const buyerId = useAuthStore((s) => s.user?.userId ?? null)
  const storeName = useAuthStore((s) => s.user?.name) || undefined
  const userName = useMemo(() => storeName ?? getNameFromJwt(), [storeName])

  /* 화면/결제 컨트롤 상태 */
  const tossRef = useRef<TossPaymentHandle>(null)
  const [openedMethod, setOpenedMethod] = useState<PaymentMethod | null>(null)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [ensuredPaymentId, setEnsuredPaymentId] = useState<string | null>(null)

  const [isTimeUpModalOpen, setIsTimeUpModalOpen] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [sellerId, setSellerId] = useState<number | null>(null)
  const [remainingSeconds, setRemainingSeconds] = useState(DEADLINE_SECONDS)

  const amountToPay = finalAmount ?? checkout.amount

  /* ───────────────────────── 초기 paymentId 생성 + 세션 저장 ───────────────────────── */
  useEffect(() => {
    if (!paymentId) {
      const id = createPaymentId()
      setPaymentId(id)

      if (checkout?.bookingId && checkout?.festivalId && sellerId) {
        saveBookingSession({
          paymentId: id,
          bookingId: checkout.bookingId,
          festivalId: checkout.festivalId,
          sellerId,
          amount: finalAmount,
          createdAt: Date.now(),
        })
      }
    }
  }, [paymentId, checkout, finalAmount, sellerId])

  /* ───────────────────────── 예매 상세 조회로 sellerId 확보 ───────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchBookingDetail({
          festivalId: checkout.festivalId,
          performanceDate: checkout.performanceDate,
          reservationNumber: checkout.bookingId,
        })

        if (!res.success) throw new Error(res.message || '상세 조회 실패')
        const sid = (res.data?.sellerId ?? res.data?.seller_id) as number | undefined
        if (!sid || sid <= 0) throw new Error('sellerId 누락')
        setSellerId(sid)
      } catch (e) {
        console.error('예매 상세 조회 실패', e)
        alert('결제 정보를 불러오지 못했습니다.')
        navigate(-1)
      }
    })()
  }, [checkout?.festivalId, checkout?.performanceDate, checkout?.bookingId, navigate])

  /* ───────────────────────── TanStack Query — 3단계 뮤테이션 ───────────────────────── */

  // 1) 결제 요청: /api/payments/request
  const requestMut = useMutation({
    mutationFn: async () => {
      const id = paymentId ?? createPaymentId()
      if (!paymentId) setPaymentId(id)

      if (!sellerId) throw new Error('판매자 정보가 없습니다.')
      if (!checkout?.bookingId || !checkout?.festivalId) throw new Error('예매 식별 정보가 없습니다.')

      const uid = getUserIdForHeader()
      if (!uid) throw new Error('로그인이 필요합니다. (buyerId 없음)')
      const buyerId = Number(uid)

      // 프론트 세션 저장
      saveBookingSession({
        paymentId: id,
        bookingId: checkout.bookingId,
        festivalId: checkout.festivalId,
        sellerId,
        amount: finalAmount,
        createdAt: Date.now(),
      })

      // 결제 요청 (PaymentOrder는 재시도 로직에서 대기)
      await requestTekcitPayment({
        paymentId: id,
        bookingId: checkout.bookingId,
        festivalId: checkout.festivalId,
        sellerId,
        buyerId,
        amount: finalAmount,
      })

      console.log('✅ 결제 요청 완료, PaymentOrder는 테킷페이 결제에서 자동 대기')
      return id
    },
  })

  // 2) 지갑 결제(비번 검증+차감): /api/tekcitpay - 재시도 로직 포함
  const tekcitPayMut = useMutation({
    mutationFn: async (password: string) => {
      const id = ensuredPaymentId ?? paymentId
      if (!id) throw new Error('paymentId가 준비되지 않았습니다.')
      // verifyTekcitPassword가 내부에서 자동 재시도 처리
      return verifyTekcitPassword({ amount: amountToPay, paymentId: id, password })
    },
  })

  // 3) 결제 완료: /api/payments/complete/{paymentId}
  const completeMut = useMutation({
    mutationFn: async () => {
      const id = ensuredPaymentId ?? paymentId
      if (!id) throw new Error('paymentId가 준비되지 않았습니다.')
      return confirmTekcitPayment(id)
    },
  })

  /* ───────────────────────── 유틸 핸들러 ───────────────────────── */
  const handleTimeUpModalClose = () => setIsTimeUpModalOpen(false)

  const routeToResult = useCallback((ok: boolean, id?: string) => {
    const params = new URLSearchParams({ type: 'booking', status: ok ? 'success' : 'fail' })
    if (id) params.set('paymentId', id)
    navigate(`/payment/result?${params.toString()}`)
  }, [navigate])

  const toggleMethod = (m: PaymentMethod) => {
    if (isPaying || remainingSeconds <= 0) return
    setOpenedMethod((prev) => (prev === m ? null : m))
    setErr(null)
  }

  /* ───────────────────────── 결제 버튼 클릭 ───────────────────────── */
  const handlePayment = async () => {
    // 공통 가드
    if (!checkout) { setErr('결제 정보를 불러오지 못했어요. 처음부터 다시 진행해주세요.'); return }
    if (!openedMethod) { setErr('결제 수단을 선택해주세요.'); return }
    if (remainingSeconds <= 0) { setErr('결제 시간이 만료되었습니다.'); setIsTimeUpModalOpen(true); return }
    if (isPaying) return

    // 지갑 결제 플로우 — 1) request 성공 → 2) 비번 모달 오픈
    if (openedMethod === 'wallet') {
      try {
        setIsPaying(true)
        setErr(null)

        // 결제 요청 — paymentId 보장
        const id = paymentId ?? createPaymentId()
        if (!paymentId) setPaymentId(id)

        await requestMut.mutateAsync()               // 서버에 결제 요청 등록
        setEnsuredPaymentId((prev) => prev ?? id)    // 모달에서도 동일 id 사용
        setIsPasswordModalOpen(true)                 // 요청 성공 시점에 모달 오픈
      } catch (e: any) {
        console.error(e)
        setErr(e?.message ?? '결제 요청에 실패했습니다.')
      } finally {
        setIsPaying(false)
      }
      return
    }

    // 카드(Toss) 결제 플로우 — 기존 로직 유지
    if (openedMethod === 'Toss') {
      const ensuredId = paymentId ?? createPaymentId()
      if (!paymentId) setPaymentId(ensuredId)

      setIsPaying(true)
      try {
        await tossRef.current?.requestPay({
          paymentId: ensuredId,
          amount: finalAmount,
          orderName,
          bookingId: checkout.bookingId,
          festivalId: festivalIdVal,
          sellerId: sellerId!,
          successUrl: `${window.location.origin}/payment/result?type=booking`,
          failUrl: `${window.location.origin}/payment/result?type=booking`,
        })
      } catch (e) {
        setErr('결제 요청 중 오류가 발생했어요.')
        routeToResult(false)
      } finally {
        setIsPaying(false)
      }
    }
  }

  /* ───────────────────────── 렌더 가드 ───────────────────────── */
  if (sellerId == null) {
    return <div className={styles.page}>sellerId가 null입니다</div>
  }

  /* ───────────────────────── 렌더 ───────────────────────── */
  return (
    <div className={styles.page}>
      <BookingPaymentHeader
        initialSeconds={DEADLINE_SECONDS}
        onTick={(sec) => setRemainingSeconds(sec)}
        onExpire={() => setIsTimeUpModalOpen(true)}
      />

      <div className={styles.container} role="main">
        {/* 좌측: 수령 방법 + 결제 수단 */}
        <section className={styles.left}>
          <div className={styles.sectionContainer}>
            <div className={styles.receiveSection}>
              <h2 className={styles.sectionTitle}>수령 방법</h2>
              <ReceiveInfo rawValue={checkout.deliveryMethod} />
            </div>

            <div>
              <h2 className={styles.sectionTitle}>결제 수단</h2>
              <PaymentSection
                ref={tossRef}
                openedMethod={openedMethod}
                onToggle={toggleMethod}
                amount={finalAmount}
                orderName={orderName}
                errorMsg={err}
                bookingId={checkout.bookingId}
                festivalId={checkout.festivalId}
                sellerId={sellerId}
              />
            </div>
          </div>
        </section>

        {/* 우측: 결제 요약/버튼 */}
        <aside className={styles.right}>
          <div className={styles.summaryCard}>
            <PaymentInfo />
          </div>

          <div className={styles.buttonWrapper}>
            <Button
              type="button"
              className={styles.payButton}
              onClick={handlePayment}
              aria-busy={isPaying}
            >
              {isPaying ? '결제 중...' : '결제하기'}
            </Button>
          </div>
        </aside>
      </div>

      {/* 지갑 비밀번호 모달 — verify → complete 순차 처리 */}
      {isPasswordModalOpen && ensuredPaymentId && (
        <PasswordInputModal
          amount={amountToPay}
          paymentId={ensuredPaymentId}
          userName={userName}
          onClose={() => setIsPasswordModalOpen(false)}
          onComplete={async (pwd) => {
            setIsPaying(true)
            setErr(null)
            try {
              // PaymentOrder 대기는 verifyTekcitPassword에서 자동 처리됨
              await tekcitPayMut.mutateAsync(pwd)              // 지갑 검증+차감 (자동 재시도)
              await completeMut.mutateAsync()                  // 결제 완료
              routeToResult(true, ensuredPaymentId)
            } catch (e: any) {
              console.error(e)
              setErr(e?.message ?? '결제 처리에 실패했습니다.')
              routeToResult(false, ensuredPaymentId)
            } finally {
              setIsPaying(false)
              setIsPasswordModalOpen(false)
            }
          }}
        />
      )}

      {/* 시간 초과 모달 */}
      {isTimeUpModalOpen && (
        <AlertModal title="시간 만료" onConfirm={handleTimeUpModalClose}>
          결제 시간이 만료되었습니다. 다시 시도해주세요.
        </AlertModal>
      )}
    </div>
  )
}

export default BookingPaymentPage