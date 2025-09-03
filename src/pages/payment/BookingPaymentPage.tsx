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
import { requestTekcitPayment, verifyTekcitPassword } from '@/shared/api/payment/tekcit'

import styles from './BookingPaymentPage.module.css'

function getNameFromJwt(): string | undefined {
  try {
    const raw = localStorage.getItem('accessToken') || ''
    const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw
    if (!token) return undefined
    const part = token.split('.')[1] ?? ''
    const safe = part.replace(/-/g, '+').replace(/_/g, '/')
    const padded = safe + '='.repeat((4 - (safe.length % 4)) % 4)
    const payload = JSON.parse(atob(padded))
    const name =
      payload?.name
    return typeof name === 'string' && name.trim() ? name.trim() : undefined
  } catch {
    return undefined
  }
}

// ⏱️ 결제 제한 시간(초) 멍
const DEADLINE_SECONDS = 5 * 60

const BookingPaymentPage: React.FC = () => {
  // 0) 네비게이션/라우터 state 멍
  const navigate = useNavigate()
  const { state } = useLocation()
  const checkout = state as CheckoutState

  // 1) 파생값 계산 — 금액/주문명/공연ID 멍
  const unitPrice = checkout?.unitPrice ?? 0
  const quantity = checkout?.quantity ?? 0
  const finalAmount = useMemo(() => unitPrice * quantity, [unitPrice, quantity]) // 결제 금액 멍
  const orderName = useMemo(() => checkout?.title, [checkout?.title]) // 주문명 멍
  const festivalIdVal = checkout?.festivalId // 가드/요청에서 사용 멍

  // 3) 로그인 사용자 ID 상태 (훅 순서 보장을 위해 useEffect에서 세팅) 멍
  // const [setBuyerId] = useState<number | null>(null)
  const [sellerId, setSellerId] = useState<number | null>(null)
  const storeName = useAuthStore((s) => s.user?.name) || undefined
  const userName = useMemo(() => storeName ?? getNameFromJwt(), [storeName])

  // 4) 결제/화면 상태 훅들 멍
  const tossRef = useRef<TossPaymentHandle>(null) // PaymentSection이 ref를 TossPayment로 전달
  const [openedMethod, setOpenedMethod] = useState<PaymentMethod | null>(null)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [ensuredPaymentId, setEnsuredPaymentId] = useState<string | null>(null)

  const openPasswordModal = () => {
    setEnsuredPaymentId((prev) => prev ?? createPaymentId()) // paymentId 확정
    setIsPasswordModalOpen(true)
  }

  const amountToPay = finalAmount ?? checkout.amount

  const [isTimeUpModalOpen, setIsTimeUpModalOpen] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [remainingSeconds, setRemainingSeconds] = useState(DEADLINE_SECONDS)

  // ✅ 결제 트랜잭션 ID 최초 1회 생성 + 동시에 프론트 세션 저장
  useEffect(() => {
    // 주석: paymentId가 아직 없으면 생성
    if (!paymentId) {
      const id = createPaymentId()
      setPaymentId(id)

      if (checkout?.bookingId && checkout?.festivalId && sellerId) {
        saveBookingSession({
          paymentId: id,                         // 프론트에서 생성한 결제ID
          bookingId: checkout.bookingId,         // 라우터 state
          festivalId: checkout.festivalId,       // 라우터 state
          sellerId: sellerId,           // 라우터 state (중요)
          amount: finalAmount,                   // 프론트 계산 금액
          createdAt: Date.now(),                 // 타임아웃 판단용
        })
      }
    }
  }, [paymentId, checkout, finalAmount, sellerId]) // 주석: finalAmount가 변하면 세션 갱신이 필요한지 정책에 따라 조정

  // 주석: buyerId가 준비되기 전에는 서버 호출 금지 (X-User-Id 누락 방지)
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

  // 9) 타임업 모달 닫기 헬퍼 멍
  const handleTimeUpModalClose = () => setIsTimeUpModalOpen(false)

  // 10) 결과 라우팅 헬퍼 멍
  const routeToResult = (ok: boolean) => {
    const params = new URLSearchParams({ type: 'booking', status: ok ? 'success' : 'fail' })
    navigate(`/payment/result?${params.toString()}`)
  }

  // 11) 결제수단 토글 멍
  const toggleMethod = (m: PaymentMethod) => {
    if (isPaying || remainingSeconds <= 0) return
    setOpenedMethod((prev) => (prev === m ? null : m))
    setErr(null)
  }

  // 12) 결제 실행 멍
  const handlePayment = async () => {
    // 기본 검증 멍
    if (!checkout) {
      setErr('결제 정보를 불러오지 못했어요. 처음부터 다시 진행해주세요.')
      return
    }
    if (!openedMethod) {
      setErr('결제 수단을 선택해주세요.')
      return
    }
    if (remainingSeconds <= 0) {
      setErr('결제 시간이 만료되었습니다.')
      setIsTimeUpModalOpen(true)
      return
    }

    if (isPaying) return

    // 지갑 결제 경로 ─ 비밀번호 모달 열기 멍
    if (openedMethod === 'wallet') {
      openPasswordModal()
      return
    }

    // 토스 결제 경로 멍
    if (openedMethod === 'Toss') {
      const ensuredId = paymentId ?? createPaymentId()
      if (!paymentId) setPaymentId(ensuredId)

      setIsPaying(true)
      try {
        // ✅ TossPaymentHandle 타입에 userId 파라미터는 없음 (헤더로 전달되므로 여기선 필요 없음) 멍
        await tossRef.current?.requestPay({
          paymentId: ensuredId,
          amount: finalAmount,             
          orderName,                       
          bookingId: checkout.bookingId,   
          festivalId: festivalIdVal,      
          sellerId: sellerId,

          successUrl: `${window.location.origin}/payment/result?type=booking`,
          failUrl: `${window.location.origin}/payment/result?type=booking`,
        })
        // PG 리다이렉트 이후 결과 페이지에서 처리 멍
      } catch (e) {
        setErr('결제 요청 중 오류가 발생했어요.')
        routeToResult(false)
      } finally {
        setIsPaying(false)
      }
    }
  }

  if (sellerId == null) {
    return <div className={styles.page}>sellerId가 null입니다</div>
  }

  // 15) 메인 렌더 멍
  return (
    <div className={styles.page}>
      <BookingPaymentHeader
        initialSeconds={DEADLINE_SECONDS}
        onTick={(sec) => setRemainingSeconds(sec)} // 매초 남은 시간 반영 멍
        onExpire={() => setIsTimeUpModalOpen(true)} // 만료 시 모달 열기 멍
      />

      <div className={styles.container} role="main">
        {/* 좌측: 수령 방법 + 결제 수단 멍 */}
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

        {/* 우측: 결제 요약/버튼 멍 */}
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

      {/* 지갑 비밀번호 모달 멍 */}
      {isPasswordModalOpen && ensuredPaymentId && (
        <PasswordInputModal
          amount={amountToPay}              // finalAmount 기반 확정 금액
          paymentId={ensuredPaymentId}      // 모달/서버/리다이렉트 모두 동일한 ID
          userName={userName}
          onClose={() => setIsPasswordModalOpen(false)}
          onComplete={(pwd) => {
            setIsPaying(true)
            try {
              navigate(`/payment/result?type=booking&status=success&paymentId=${ensuredPaymentId}`)
            } catch {
              navigate(`/payment/result?type=booking&status=fail`)
            } finally {
              setIsPaying(false)
              setIsPasswordModalOpen(false)
            }
          }}
        />
      )}

      {/* 시간 초과 모달 멍 */}
      {isTimeUpModalOpen && (
        <AlertModal title="시간 만료" onConfirm={handleTimeUpModalClose}>
          결제 시간이 만료되었습니다. 다시 시도해주세요.
        </AlertModal>
      )}
    </div>
  )
}

export default BookingPaymentPage