import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

// ── 결제 섹션 컴포넌트들 멍
import WalletPayment from '@/components/payment/pay/WalletPayment'
import TossPayment, { type TossPaymentHandle } from '@/components/payment/pay/TossPayment'
import PaymentInfo from '@/components/payment/pay/PaymentInfo'
import BookingPaymentHeader from '@/components/payment/pay/BookingPaymentHeader'
import ReceiveInfo, { type ReceiveType } from '@/components/payment/delivery/ReceiveInfo'

// ── 공통 UI 멍
import Button from '@/components/common/button/Button'
import PasswordInputModal from '@/components/payment/modal/PasswordInputModal'
import AlertModal from '@/components/common/modal/AlertModal'

// ── 스타일 멍
import styles from './BookingPaymentPage.module.css'

// ✅ 결제수단 타입 멍
type PaymentMethod = 'wallet' | 'Toss'

// ✅ 결제 타이머(초) 멍
const DEADLINE_SECONDS = 5 * 60

// ✅ 접근성: 페이지 타이틀 id 멍
const PAGE_TITLE_ID = 'bookingPaymentMainTitle'

// ✅ 고유 결제 ID 생성 유틸(프론트 생성 전략) 멍
function createPaymentId(): string {
  const c = globalThis.crypto as Crypto | undefined
  if (c?.randomUUID) return c.randomUUID()
  const buf = c?.getRandomValues
    ? c.getRandomValues(new Uint32Array(2))
    : new Uint32Array([Date.now() & 0xffffffff, (Math.random() * 1e9) | 0])
  return `pay_${Array.from(buf).join('')}`
}

// ✅ (예시) 로그인 사용자 ID를 안전히 얻는 헬퍼 멍
// - 실제 프로젝트에선 auth store/context/cookie 등으로 교체 멍
function getUserIdSafely(): number {
  const v = Number(localStorage.getItem('userId') ?? NaN)
  return Number.isFinite(v) ? v : 1001 // 연동안이면 목값 1001 멍
}

const BookingPaymentPage: React.FC = () => {
  const navigate = useNavigate()

  // ✅ 토스 결제 ref (자식 컴포넌트에 결제 명령 내릴 때 사용) 멍
  const tossRef = useRef<TossPaymentHandle>(null)

  // ✅ UI/상태 멍
  const [openedMethod, setOpenedMethod] = useState<PaymentMethod | null>(null)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isTimeUpModalOpen, setIsTimeUpModalOpen] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // ✅ 수령방법(ReceiveInfo가 onChange 미지원 → 고정값) 멍
  const [receiveType] = useState<ReceiveType>('QR')

  // ✅ 목데이터(연동 전) 멍
  const buyerName = '홍길동'
  const festivalId = 'FSTV-2025-0921-001'
  const posterUrl = 'https://placehold.co/150x200?text=%ED%8F%AC%EC%8A%A4%ED%84%B0' // via.placeholder 대체
  const title = '2025 변진섭 전국투어 콘서트 : 변천 시 시즌2 -'
  const dateTimeLabel = '2025.09.21 (일) 17:00'
  const unitPrice = 1
  const quantity = 1

  // ✅ 배송비 계산 멍
  const isCourier =
    (receiveType as unknown as string) === 'DELIVERY' ||
    (receiveType as unknown as string) === 'COURIER'
  const shippingFee = isCourier ? 3_200 : 0

  // ✅ 총 결제금액/주문명 메모이제이션 멍
  const amount = useMemo(
    () => unitPrice * quantity + shippingFee,
    [unitPrice, quantity, shippingFee],
  )
  const orderName = useMemo(() => '티켓 예매', []) // 필요 시 상세명으로 치환 멍

  // ✅ paymentId는 진입 시 1회 생성해 보관 멍
  const [paymentId, setPaymentId] = useState<string | null>(null)
  useEffect(() => {
    if (!paymentId) setPaymentId(createPaymentId())
  }, [paymentId])

  // ✅ 타이머 상태 및 동작 멍
  const [remainingSeconds, setRemainingSeconds] = useState(DEADLINE_SECONDS)
  useEffect(() => {
    const id = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          setIsTimeUpModalOpen(true) // ⏰ 시간 만료 시 모달 오픈
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // ✅ 시간만료 모달 확인: 모달만 닫기 멍
  const handleTimeUpModalClose = () => setIsTimeUpModalOpen(false)

  // ✅ 결과 페이지 이동 헬퍼 멍
  const routeToResult = (ok: boolean) => {
    const params = new URLSearchParams({ type: 'booking', status: ok ? 'success' : 'fail' })
    navigate(`/payment/result?${params.toString()}`)
  }

  // ✅ 결제수단 아코디언 토글 멍
  const toggleMethod = (m: PaymentMethod) => {
    if (isPaying || remainingSeconds <= 0) return
    setOpenedMethod((prev) => (prev === m ? null : m))
    setErr(null)
  }

  // ✅ 결제 실행 멍
  const handlePayment = async () => {
    // 1) 선행 검증 멍
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
    setErr(null)

    // 2) 킷페이(지갑) 멍
    if (openedMethod === 'wallet') {
      setIsPasswordModalOpen(true)
      return
    }

    // 3) 토스 멍
    if (openedMethod === 'Toss') {
      // paymentId 보장(없으면 즉시 생성해서 상태 반영) 멍
      const ensuredId = paymentId ?? createPaymentId()
      if (!paymentId) setPaymentId(ensuredId)

      // ── 서버 사전요청에 필요한 도메인 값들(연동안 전 목데이터) 멍
      const userId = getUserIdSafely()       // X-User-Id 헤더로 전달될 값 멍
      const bookingId = 'BKG-20250822-01'    // 가예매/주문 ID(목) 멍
      const sellerId = 2002                  // 판매자 ID(목) 멍

      setIsPaying(true)
      try {
        // ✅ TossPayment로 백엔드 API에 필요한 모든 인자를 전달 멍
        await tossRef.current?.requestPay({
          paymentId: ensuredId,
          amount,
          orderName,
          userId,         // ✅ X-User-Id 헤더용
          bookingId,      // ✅ 백엔드 DTO 필수 필드
          festivalId,     // ✅ 백엔드 DTO 필수 필드  
          sellerId,       // ✅ 백엔드 DTO 필수 필드
        })

        // NOTE:
        // - PortOne.requestPayment 이후에는 리다이렉트 플로우가 동작
        // - 승인확인은 결과 페이지(/payment/result)에서 paymentConfirm 호출로 처리하는 패턴 권장 멍
      } catch (e) {
        console.error(e)
        setErr('결제 요청 중 오류가 발생했어요.')
        routeToResult(false)
      } finally {
        setIsPaying(false)
      }
    }
  }

  // ✅ 결제 버튼 활성 조건/타이머 표시 멍
  const canPay = !!openedMethod && !isPaying && remainingSeconds > 0
  const timeString = `${String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:${String(
    remainingSeconds % 60,
  ).padStart(2, '0')}`

  return (
    <div className={styles.page}>
      {/* 상단 타이머/헤더 멍 */}
      <BookingPaymentHeader timeString={timeString} />

      <div className={styles.container} role="main" aria-labelledby={PAGE_TITLE_ID}>
        <h1 id={PAGE_TITLE_ID} className="sr-only">
          예매 결제
        </h1>

        {/* 좌측: 수령방법 + 결제수단 멍 */}
        <section className={styles.left}>
          <div className={styles.sectionContainer}>
            {/* 수령 방법 섹션 멍 */}
            <div className={styles.receiveSection}>
              <h2 className={styles.sectionTitle}>수령 방법</h2>
              <ReceiveInfo value={receiveType} />
            </div>

            {/* 결제 수단 섹션 멍 */}
            <div>
              <h2 className={styles.sectionTitle}>결제 수단</h2>

              <section className={styles.paymentBox}>
                {/* ── 킷페이 멍 */}
                <div className={styles.methodCard}>
                  <button
                    className={styles.methodHeader}
                    onClick={() => toggleMethod('wallet')}
                    aria-expanded={openedMethod === 'wallet'}
                    type="button"
                  >
                    <span className={styles.radio + (openedMethod === 'wallet' ? ` ${styles.radioOn}` : '')} />
                    <span className={styles.methodText}>킷페이 (포인트 결제)</span>
                  </button>

                  {openedMethod === 'wallet' && (
                    <div className={styles.methodBody}>
                      <WalletPayment isOpen onToggle={() => toggleMethod('wallet')} dueAmount={amount} />
                    </div>
                  )}
                </div>

                {/* ── 토스 멍 */}
                <div className={styles.methodCard}>
                  <button
                    className={styles.methodHeader}
                    onClick={() => toggleMethod('Toss')}
                    aria-expanded={openedMethod === 'Toss'}
                    type="button"
                  >
                    <span className={styles.radio + (openedMethod === 'Toss' ? ` ${styles.radioOn}` : '')} />
                    <span className={styles.methodText}>토스페이먼츠 (신용/체크)</span>
                  </button>

                  {openedMethod === 'Toss' && (
                    <div className={styles.methodBody}>
                      <TossPayment
                        ref={tossRef}
                        isOpen
                        onToggle={() => toggleMethod('Toss')}
                        amount={amount}               // 표시/디폴트용 멍
                        orderName={orderName}         // 표시/디폴트용 멍
                        redirectUrl={`${window.location.origin}/payment/result?type=booking`} // 리다이렉트 베이스 멍
                      />
                    </div>
                  )}
                </div>

                {/* 에러 메시지 멍 */}
                {err && <p className={styles.errorMsg}>{err}</p>}
              </section>
            </div>
          </div>
        </section>

        {/* 우측 요약 멍 */}
        <aside className={styles.right}>
          <div className={styles.summaryCard}>
            <PaymentInfo
              posterUrl={posterUrl}
              title={title}
              dateTimeLabel={dateTimeLabel}
              unitPrice={unitPrice}
              quantity={quantity}
              shippingFee={shippingFee}
              receiveType={receiveType}
              buyerName={buyerName}
              festivalId={festivalId}
              showFestivalId={false}
            />
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

      {/* 비밀번호 모달(지갑 결제) 멍 */}
      {isPasswordModalOpen && (
        <PasswordInputModal
          onClose={() => setIsPasswordModalOpen(false)}
          onComplete={async () => {
            setIsPaying(true)
            try {
              // ✅ 목 결제 지연 멍
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