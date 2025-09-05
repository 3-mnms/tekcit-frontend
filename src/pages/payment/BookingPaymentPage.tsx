// src/pages/payment/BookingPaymentPage.tsx
import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

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

// ✅ request만 사용 (complete import 제거)
import { requestPayment, type PaymentRequestDTO } from '@/shared/api/payment/payments'
import { useTokenInfoQuery } from '@/shared/api/useTokenInfoQuery'

import styles from './BookingPaymentPage.module.css'

// ... getNameFromJwt 동일 ...

const DEADLINE_SECONDS = 5 * 60

const BookingPaymentPage: React.FC = () => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const checkout = state as CheckoutState

  const unitPrice = checkout?.unitPrice ?? 0
  const quantity = checkout?.quantity ?? 0
  const finalAmount = useMemo(() => unitPrice * quantity, [unitPrice, quantity])
  const orderName = useMemo(() => checkout?.title, [checkout?.title])
  const festivalIdVal = checkout?.festivalId

  const [sellerId, setSellerId] = useState<number | null>(null)
  const storeName = useAuthStore((s) => s.user?.name) || undefined
  const userName = useMemo(() => storeName ?? getNameFromJwt(), [storeName])

  const tossRef = useRef<TossPaymentHandle>(null)
  const [openedMethod, setOpenedMethod] = useState<PaymentMethod | null>(null)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [ensuredPaymentId, setEnsuredPaymentId] = useState<string | null>(null)

  const { data: tokenInfo } = useTokenInfoQuery()
  const userId = Number(tokenInfo?.userId)

  const amountToPay = finalAmount ?? checkout.amount

  const [isTimeUpModalOpen, setIsTimeUpModalOpen] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [remainingSeconds, setRemainingSeconds] = useState(DEADLINE_SECONDS)

  // 최초 paymentId 생성 + 세션 저장
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

  // sellerId 확보
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

  const handleTimeUpModalClose = () => setIsTimeUpModalOpen(false)
  const routeToResult = (ok: boolean) => {
    const params = new URLSearchParams({ type: 'booking', status: ok ? 'success' : 'fail' })
    navigate(`/payment/result?${params.toString()}`)
  }

  const toggleMethod = (m: PaymentMethod) => {
    if (isPaying || remainingSeconds <= 0) return
    setOpenedMethod((prev) => (prev === m ? null : m))
    setErr(null)
  }

  // request → (wallet) 모달(tekcitpay) → (완료 라우팅)  ※ complete 호출 없음
  const handlePayment = async () => {
    if (!checkout) { setErr('결제 정보를 불러오지 못했어요. 처음부터 다시 진행해주세요.'); return }
    if (!openedMethod) { setErr('결제 수단을 선택해주세요.'); return }
    if (remainingSeconds <= 0) { setErr('결제 시간이 만료되었습니다.'); setIsTimeUpModalOpen(true); return }
    if (isPaying) return

    // paymentId 고정
    const ensuredId = ensuredPaymentId ?? paymentId ?? createPaymentId()
    if (!ensuredPaymentId) setEnsuredPaymentId(ensuredId)
    if (!paymentId) setPaymentId(ensuredId)

    if (!Number.isFinite(userId)) { setErr('로그인이 필요합니다.'); return }
    if (!sellerId) { setErr('판매자 정보가 없어요. 다시 시도해 주세요.'); return }

    // 1) REQUEST (지갑은 'POINT_PAYMENT', 카드/토스는 'CARD')
    const dto: PaymentRequestDTO = {
      paymentId: ensuredId,
      bookingId: checkout.bookingId ?? null,
      festivalId: checkout.festivalId ?? null,
      paymentRequestType: openedMethod === 'wallet'
        ? 'POINT_PAYMENT_REQUESTED'
        : 'GENERAL_PAYMENT_REQUESTED',
      buyerId: userId!,
      sellerId: sellerId!,
      amount: finalAmount,
      currency: 'KRW',
      payMethod: openedMethod === 'wallet' ? 'POINT_PAYMENT' : 'CARD',
    }

    setIsPaying(true)
    try {
      await requestPayment(dto, userId!)
    } catch (e: any) {
      console.error('[requestPayment] failed', e?.response?.status, e?.response?.data)
      setErr('결제 준비에 실패했어요. 잠시 후 다시 시도해 주세요.')
      setIsPaying(false)
      return
    }

    // 2) 지갑이면 비번 모달 열기 → 모달에서 tekcitpay 성공 시 바로 성공 라우팅
    if (openedMethod === 'wallet') {
      setIsPaying(false)
      setIsPasswordModalOpen(true)
      return
    }

    // 2') 카드/토스는 PG 이동 (결과 페이지에서 별도 처리)
    try {
      await tossRef.current?.requestPay({
        paymentId: ensuredId,
        amount: finalAmount,
        orderName,
        bookingId: checkout.bookingId,
        festivalId: festivalIdVal,
        sellerId: sellerId!,
        successUrl: `${window.location.origin}/payment/result?type=booking&paymentId=${encodeURIComponent(ensuredId)}&status=success`,
        failUrl: `${window.location.origin}/payment/result?type=booking&paymentId=${encodeURIComponent(ensuredId)}&status=fail`,
      })
    } catch {
      setErr('결제 요청 중 오류가 발생했어요.')
      routeToResult(false)
    } finally {
      setIsPaying(false)
    }
  }

  if (sellerId == null) return <div className={styles.page}>sellerId가 null입니다</div>

  return (
    <div className={styles.page}>
      <BookingPaymentHeader
        initialSeconds={DEADLINE_SECONDS}
        onTick={(sec) => setRemainingSeconds(sec)}
        onExpire={() => setIsTimeUpModalOpen(true)}
      />

      <div className={styles.container} role="main">
        {/* 좌측 */}
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

        {/* 우측 */}
        <aside className={styles.right}>
          <div className={styles.summaryCard}><PaymentInfo /></div>
          <div className={styles.buttonWrapper}>
            <Button type="button" className={styles.payButton} onClick={handlePayment} aria-busy={isPaying}>
              {isPaying ? '결제 중...' : '결제하기'}
            </Button>
          </div>
        </aside>
      </div>

      {/* 지갑 비밀번호 모달: tekcitpay 성공 시 바로 라우팅 (complete 호출 X) */}
      {isPasswordModalOpen && ensuredPaymentId && Number.isFinite(userId) && (
        <PasswordInputModal
          amount={amountToPay}
          paymentId={ensuredPaymentId}
          userName={userName}
          userId={userId as number}
          onClose={() => setIsPasswordModalOpen(false)}
          onComplete={() => {
            // tekcitpay 성공 후 콜백
            navigate(`/payment/result?type=booking&status=success&paymentId=${ensuredPaymentId}`)
            setIsPasswordModalOpen(false)
          }}
        />
      )}

      {isTimeUpModalOpen && (
        <AlertModal title="시간 만료" onConfirm={handleTimeUpModalClose}>
          결제 시간이 만료되었습니다. 다시 시도해주세요.
        </AlertModal>
      )}
    </div>
  )
}

export default BookingPaymentPage
