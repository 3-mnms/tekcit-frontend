import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import WalletPayment from '@/components/payment/pay/WalletPayment'
import TossPayment, { type TossPaymentHandle } from '@/components/payment/pay/TossPayment'
import PaymentInfo from '@/components/payment/pay/PaymentInfo'
import BookingPaymentHeader from '@/components/payment/pay/BookingPaymentHeader'
import ReceiveInfo, { type ReceiveType } from '@/components/payment/delivery/ReceiveInfo'

import Button from '@/components/common/button/Button'
import PasswordInputModal from '@/components/payment/modal/PasswordInputModal'
import AlertModal from '@/components/common/modal/AlertModal'

import styles from './BookingPaymentPage.module.css'

// ✅ 결제 수단 타입
type PaymentMethod = 'wallet' | 'Toss'

// ✅ 라우터 state 타입
type CheckoutState = {
  posterUrl?: string
  title: string
  dateTimeLabel: string
  unitPrice: number
  quantity: number
  receiveType: string
  buyerName?: string
  festivalId?: string
}

const DEADLINE_SECONDS = 5 * 60

// ✅ 고유 결제 ID 생성
function createPaymentId(): string {
  const c = globalThis.crypto as Crypto | undefined
  if (c?.randomUUID) return c.randomUUID()
  const buf = c?.getRandomValues
    ? c.getRandomValues(new Uint32Array(2))
    : new Uint32Array([Date.now() & 0xffffffff, (Math.random() * 1e9) | 0])
  return `pay_${Array.from(buf).join('')}`
}

// ✅ 로그인 사용자 ID 획득(미연동 시 목값)
function getUserIdSafely(): number {
  const v = Number(localStorage.getItem('userId') ?? NaN)
  return Number.isFinite(v) ? v : 1001
}

const BookingPaymentPage: React.FC = () => {
  const navigate = useNavigate()

  // ✅ (1) 페이지 최상단에서 라우터 state 받기
  const { state } = useLocation()
  const checkout = state as CheckoutState | undefined

  // ✅ (2) 파생값들은 컴포넌트 최상위에서 계산 (Hook 규칙 준수)
  const unitPrice = checkout?.unitPrice ?? 0    // 없으면 0으로 방어
  const quantity  = checkout?.quantity  ?? 0    // 없으면 0으로 방어
  const amount    = useMemo(() => unitPrice * quantity, [unitPrice, quantity]) // 총 결제 금액
  const orderName = useMemo(
    () => (checkout?.title || '티켓 예매'),
    [checkout?.title]
  )
  const festivalIdVal = checkout?.festivalId ?? ''
  const receiveTypeVal: ReceiveType =
    checkout?.receiveType === 'DELIVERY' ? 'DELIVERY' : 'QR'

  // ✅ (3) 나머지 훅들
  const tossRef = useRef<TossPaymentHandle>(null)
  const [openedMethod, setOpenedMethod] = useState<PaymentMethod | null>(null)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isTimeUpModalOpen, setIsTimeUpModalOpen] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // ✅ paymentId는 진입 시 1회 생성해 보관
  const [paymentId, setPaymentId] = useState<string | null>(null)
  useEffect(() => {
    if (!paymentId) setPaymentId(createPaymentId())
  }, [paymentId])

  // ✅ 타이머
  const [remainingSeconds, setRemainingSeconds] = useState(DEADLINE_SECONDS)
  useEffect(() => {
    const id = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          setIsTimeUpModalOpen(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

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

  // ✅ 결제 실행
  const handlePayment = async () => {
    // 필수 체크
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
    setErr(null)

    // 지갑 결제
    if (openedMethod === 'wallet') {
      setIsPasswordModalOpen(true)
      return
    }

    // 토스 결제
    if (openedMethod === 'Toss') {
      const ensuredId = paymentId ?? createPaymentId()
      if (!paymentId) setPaymentId(ensuredId)

      const userId = getUserIdSafely()
      const bookingId = 'BKG-20250822-01' // TODO: 실제 값 연동 시 교체
      const sellerId = 2002               // TODO: 실제 값 연동 시 교체

      setIsPaying(true)
      try {
        await tossRef.current?.requestPay({
          paymentId: ensuredId,
          amount,               // ✅ state 기반
          orderName,            // ✅ state 기반
          userId,
          bookingId,
          festivalId: festivalIdVal, // ✅ state 기반
          sellerId,
        })
      } catch (e) {
        console.error(e)
        setErr('결제 요청 중 오류가 발생했어요.')
        routeToResult(false)
      } finally {
        setIsPaying(false)
      }
    }
  }

  const canPay = !!openedMethod && !isPaying && remainingSeconds > 0
  const timeString = `${String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:${String(remainingSeconds % 60).padStart(2, '0')}`

  return (
    <div className={styles.page}>
      <BookingPaymentHeader timeString={timeString} />

      <div className={styles.container} role="main">
        <h1 className="sr-only">예매 결제</h1>

        {/* 좌측: 수령 방법 + 결제 수단 */}
        <section className={styles.left}>
          <div className={styles.sectionContainer}>
            <div className={styles.receiveSection}>
              <h2 className={styles.sectionTitle}>수령 방법</h2>
              {/* ✅ 페이지 state 파생값으로 전달 */}
              <ReceiveInfo value={receiveTypeVal} />
            </div>

            <div>
              <h2 className={styles.sectionTitle}>결제 수단</h2>
              <section className={styles.paymentBox}>
                {/* 킷페이 */}
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

                {/* 토스 */}
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
                        amount={amount}
                        orderName={orderName}
                        redirectUrl={`${window.location.origin}/payment/result?type=booking`}
                      />
                    </div>
                  )}
                </div>

                {err && <p className={styles.errorMsg}>{err}</p>}
              </section>
            </div>
          </div>
        </section>

        {/* 우측 요약: 페이지 → PaymentInfo로 직접 props 전달 */}
        <aside className={styles.right}>
          <div className={styles.summaryCard}>
            {checkout && (
              <PaymentInfo
                posterUrl={checkout.posterUrl}
                title={checkout.title}
                dateTimeLabel={checkout.dateTimeLabel}
                unitPrice={checkout.unitPrice}
                quantity={checkout.quantity}
                receiveType={checkout.receiveType}
                buyerName={checkout.buyerName}
              />
            )}
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

      {/* 지갑 비번 모달 */}
      {isPasswordModalOpen && (
        <PasswordInputModal
          onClose={() => setIsPasswordModalOpen(false)}
          onComplete={async () => {
            setIsPaying(true)
            try {
              await new Promise((r) => setTimeout(r, 700))
              routeToResult(true)
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
