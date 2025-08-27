import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import { type TossPaymentHandle } from '@/components/payment/pay/TossPayment'
import PaymentInfo from '@/components/payment/pay/PaymentInfo'
import BookingPaymentHeader from '@/components/payment/pay/BookingPaymentHeader'
import ReceiveInfo, { type ReceiveType } from '@/components/payment/delivery/ReceiveInfo'

import Button from '@/components/common/button/Button'
import PasswordInputModal from '@/components/payment/modal/PasswordInputModal'
import AlertModal from '@/components/common/modal/AlertModal'

import PaymentSection from '@/components/payment/pay/PaymentSection'
import type { CheckoutState, PaymentMethod } from '@/models/payment/types/paymentTypes'
import { createPaymentId, getUserIdSafely } from '@/models/payment/utils/paymentUtils'
import styles from './BookingPaymentPage.module.css'

// 5분
const DEADLINE_SECONDS = 5 * 60

const BookingPaymentPage: React.FC = () => {
  const navigate = useNavigate()

  // (1) 라우터 state 획득 ─ 결제에 필요한 기본 정보
  const { state } = useLocation()
  const checkout = state as CheckoutState | undefined

  // (2) 파생값 계산 ─ 클라이언트 백업용 금액 계산 등
  const unitPrice = checkout?.unitPrice ?? 0
  const quantity = checkout?.quantity ?? 0
  const amountClient = useMemo(() => unitPrice * quantity, [unitPrice, quantity])
  const orderName = useMemo(() => checkout?.title || '티켓 예매', [checkout?.title])
  const festivalIdVal = checkout?.festivalId ?? ''

  // 수령 방법 (기본값: QR)
  const receiveTypeRaw = checkout?.deliveryMethod ?? 'QR'
  const receiveTypeVal: ReceiveType = receiveTypeRaw === 'DELIVERY' ? 'DELIVERY' : 'QR'

  // (3) 초기 진입 가드 ─ 필수 데이터 없으면 알림 후 이전 화면/홈으로 이동
  useEffect(() => {
    // ✅ 필수 값들 체크: bookingId/sellerId는 예매 단계에서 생성/확보되어 state로 전달된다고 가정
    const hasEssential =
      !!checkout &&
      !!checkout.festivalId &&
      !!checkout.bookingId &&             
      typeof checkout.sellerId === 'number' &&
      checkout.sellerId > 0 &&
      unitPrice > 0 &&
      quantity > 0

    if (!hasEssential) {
      alert('결제 정보가 유효하지 않습니다. 처음부터 다시 시도해주세요.')
      navigate(-1) // 또는 navigate('/', { replace: true })
    }
  }, [checkout, unitPrice, quantity, navigate])

  // 총 결제 금액은 프론트에서
  const finalAmount = amountClient
  
  // (4) 기타 훅/상태 ─ 멍
  const tossRef = useRef<TossPaymentHandle>(null) // PaymentSection이 forwardRef로 TossPaymentHandle을 전달한다고 가정
  const [openedMethod, setOpenedMethod] = useState<PaymentMethod | null>(null)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isTimeUpModalOpen, setIsTimeUpModalOpen] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // 결제 트랜잭션 식별자 ─ 최초 1회 생성 후 유지 멍
  const [paymentId, setPaymentId] = useState<string | null>(null)
  useEffect(() => {
    if (!paymentId) setPaymentId(createPaymentId())
  }, [paymentId])

  // 헤더 타이머 관리 멍
  const [remainingSeconds, setRemainingSeconds] = useState(DEADLINE_SECONDS)
  const handleTimeUpModalClose = () => setIsTimeUpModalOpen(false)

  // 결제 결과 라우팅 헬퍼 멍
  const routeToResult = (ok: boolean) => {
    const params = new URLSearchParams({ type: 'booking', status: ok ? 'success' : 'fail' })
    navigate(`/payment/result?${params.toString()}`)
  }

  // 결제수단 토글 멍
  const toggleMethod = (m: PaymentMethod) => {
    if (isPaying || remainingSeconds <= 0) return
    setOpenedMethod(prev => (prev === m ? null : m))
    setErr(null)
  }

  // 결제 실행 핸들러 멍
  const handlePayment = async () => {
    // 기본 검증
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

    // 1) 필수 데이터 가드(라우터 state에 반드시 들어있어야 함)
    if (!checkout.bookingId || !checkout.sellerId || !festivalIdVal) {
      alert('결제 정보가 부족해 결제를 진행할 수 없어요.')
      navigate(-1)
      return
    }

    // 2) 로그인 가드 ─ 미로그인 시 alert 후 로그인 페이지로 보냄
    let buyerId: number
    try {
      buyerId = getUserIdSafely() // ✅ useAuthStore 기반, 미로그인이면 throw
    } catch {
      alert('로그인이 필요합니다. 로그인 후 다시 시도해주세요.')
      navigate('/login')
      return
    }

    if (isPaying) return
    setErr(null)

    // 테킷 페이 결제 경로 ─ 비번 모달 열기
    if (openedMethod === 'wallet') {
      setIsPasswordModalOpen(true)
      return
    }

    // 토스 결제 경로 멍
    if (openedMethod === 'Toss') {
      const ensuredId = paymentId ?? createPaymentId()
      if (!paymentId) setPaymentId(ensuredId)

      setIssetIsPaying(true)
      try {
        await tossRef.current?.requestPay({
          paymentId: ensuredId,
          amount: finalAmount,                // ✅ 실제 결제 금액(프론트 계산)
          orderName,
          userId: buyerId,                    // ✅ X-User-Id 헤더에 들어갈 값
          bookingId: checkout.bookingId,      // ✅ 예매 단계에서 확보된 값
          festivalId: festivalIdVal,
          sellerId: checkout.sellerId,        // ✅ 예매 단계에서 확보된 값
        })
        // 필요 시 결과 라우팅/검증 추가
      } catch (e) {
        console.error(e)
        setErr('결제 요청 중 오류가 발생했어요.')
        routeToResult(false)
      } finally {
        setIsPaying(false)
      }
    }
  }

  const canPay =
    !!openedMethod &&
    !isPaying &&
    remainingSeconds > 0 &&
    !!checkout?.bookingId &&           // ✅ 필수 데이터 존재해야 버튼 활성
    typeof checkout?.sellerId === 'number' &&
    checkout!.sellerId! > 0

  return (
    <div className={styles.page}>
      <BookingPaymentHeader
        initialSeconds={DEADLINE_SECONDS}
        onTick={(sec) => setRemainingSeconds(sec)}   // 매초 남은 시간 반영
        onExpire={() => setIsTimeUpModalOpen(true)}  // 만료 시 모달 열기
      />

      <div className={styles.container} role="main">
        {/* 좌측: 수령 방법 + 결제 수단 멍 */}
        <section className={styles.left}>
          <div className={styles.sectionContainer}>
            <div className={styles.receiveSection}>
              <h2 className={styles.sectionTitle}>수령 방법</h2>
              <ReceiveInfo value={receiveTypeVal} />
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
              disabled={!canPay}
              aria-busy={isPaying}
            >
              {isPaying ? '결제 중...' : '결제하기'}
            </Button>
          </div>
        </aside>
      </div>

      {/* 지갑 비밀번호 모달 멍 */}
      {isPasswordModalOpen && (
        <PasswordInputModal
          onClose={() => setIsPasswordModalOpen(false)}
          onComplete={async () => {
            setIsPaying(true)
            try {
              // TODO: 지갑 결제 API 연동
              await new Promise((r) => setTimeout(r, 700))
              routeToResult(true)
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
