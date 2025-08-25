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

// ✅ (NEW) 서버 세션 생성 API (엔드포인트는 프로젝트에 맞게 구현/수정)
import { api } from '@/shared/api/axios'

// 결제 수단 타입
type PaymentMethod = 'wallet' | 'Toss'

// ✅ 라우터 state 타입 (호환 위해 optional로 둠)
type CheckoutState = {
  posterUrl?: string
  title: string
  performanceDate: string      // 신규 키
  unitPrice: number
  quantity: number
  deliveryMethod: string       // 신규 키: 'QR' | 'DELIVERY'
  buyerName?: string
  bookerName?: string
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

// ✅ 로그인 사용자 ID 획득 (미연동 시 목값)
function getUserIdSafely(): number {
  const v = Number(localStorage.getItem('userId') ?? NaN)
  return Number.isFinite(v) ? v : 1001
}

const BookingPaymentPage: React.FC = () => {
  const navigate = useNavigate()

  // (1) 페이지 최상단에서 라우터 state 받기
  const { state } = useLocation()
  const checkout = state as CheckoutState | undefined

  // (2) 파생값 계산
  const unitPrice = checkout?.unitPrice ?? 0
  const quantity  = checkout?.quantity  ?? 0
  const amount    = useMemo(() => unitPrice * quantity, [unitPrice, quantity]) // 클라 계산(백업용)
  const orderName = useMemo(() => checkout?.title || '티켓 예매', [checkout?.title])
  const festivalIdVal = checkout?.festivalId ?? ''

  // ✅ receiveType ↔ deliveryMethod 호환 처리
  const receiveTypeRaw = checkout?.deliveryMethod ?? 'QR'
  const receiveTypeVal: ReceiveType = receiveTypeRaw === 'DELIVERY' ? 'DELIVERY' : 'QR'

  // (3) 나머지 훅들
  const tossRef = useRef<TossPaymentHandle>(null)
  const [openedMethod, setOpenedMethod] = useState<PaymentMethod | null>(null)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isTimeUpModalOpen, setIsTimeUpModalOpen] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // paymentId는 진입 시 1회 생성해 보관
  const [paymentId, setPaymentId] = useState<string | null>(null)
  useEffect(() => {
    if (!paymentId) setPaymentId(createPaymentId())
  }, [paymentId])

  // ✅ (NEW) 서버 세션 값 보관: bookingId / sellerId / amount
  const [sessionBookingId, setSessionBookingId] = useState<string | null>(null)
  const [sessionSellerId,   setSessionSellerId] = useState<number | null>(null)
  const [sessionAmount,     setSessionAmount]   = useState<number | null>(null)
  const [isSessionLoading,  setIsSessionLoading]= useState<boolean>(false)

  // ✅ (NEW) 진입 시 결제 세션 생성
  useEffect(() => {
    // checkout 없으면 세션 생성 불가
    if (!checkout) return

    // 서버로 넘길 payload (백엔드 스펙 맞게 수정)
    const payload = {
      festivalId: festivalIdVal,
      unitPrice,
      quantity,
      deliveryMethod: receiveTypeVal, // 'QR' | 'DELIVERY'
      title: orderName,
    }

    ;(async () => {
      try {
        setIsSessionLoading(true)
        // ⚠️ 엔드포인트/response는 백엔드에 맞추세요!
        const { data } = await api.post('/payments/session', payload)

        // ✅ 서버 확정값 반영
        setSessionBookingId(data.bookingId)
        setSessionSellerId(data.sellerId)
        setSessionAmount(data.amount)       // 서버가 최종 확정한 금액(신뢰 소스)
      } catch (e) {
        console.error('[session] createPaymentSession error:', e)
        setErr('결제 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.')
      } finally {
        setIsSessionLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkout?.festivalId, unitPrice, quantity, receiveTypeVal, orderName])

  // ✅ (NEW) 최종 결제 금액: 서버 금액 우선, 없으면 클라 계산값
  const finalAmount = sessionAmount ?? amount

  // 타이머(헤더가 관리)
  const [remainingSeconds, setRemainingSeconds] = useState(DEADLINE_SECONDS)
  const handleTimeUpModalClose = () => setIsTimeUpModalOpen(false)

  // 결제 결과 페이지 이동 (쿼리 파라미터: 성공/실패)
  const routeToResult = (ok: boolean) => {
    const params = new URLSearchParams({ type: 'booking', status: ok ? 'success' : 'fail' })
    navigate(`/payment/result?${params.toString()}`)
  }

  const toggleMethod = (m: PaymentMethod) => {
    if (isPaying || remainingSeconds <= 0) return
    setOpenedMethod((prev) => (prev === m ? null : m))
    setErr(null)
  }

  // 결제 실행
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
    // ✅ 세션 준비 안 됐으면 막기
    if (isSessionLoading || !sessionBookingId || !sessionSellerId) {
      setErr('결제 준비 중입니다. 잠시만 기다려주세요.')
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

      setIsPaying(true)
      try {
        await tossRef.current?.requestPay({
          paymentId: ensuredId,
          amount: finalAmount,          // ✅ 서버 확정 금액 우선
          orderName,                    // (필요 시 서버 orderName으로 치환 가능)
          userId,
          bookingId: sessionBookingId,  // ✅ 서버 세션 값
          festivalId: festivalIdVal,    // ✅ payload에서 받은 값
          sellerId: sessionSellerId,    // ✅ 서버 세션 값
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

  // ✅ 세션 로딩/만료/결제중 등에 따라 버튼 비활성
  const canPay = !!openedMethod && !isPaying && remainingSeconds > 0 && !isSessionLoading

  return (
    <div className={styles.page}>
      {/* ⏱️ 타이머는 헤더가 관리 */}
      <BookingPaymentHeader
        initialSeconds={DEADLINE_SECONDS}
        onTick={(sec) => setRemainingSeconds(sec)}   // 매초 남은 시간 반영
        onExpire={() => setIsTimeUpModalOpen(true)}  // 만료 시 모달 오픈
      />

      <div className={styles.container} role="main">
        {/* 좌측: 수령 방법 + 결제 수단 */}
        <section className={styles.left}>
          <div className={styles.sectionContainer}>
            <div className={styles.receiveSection}>
              <h2 className={styles.sectionTitle}>수령 방법</h2>
              {/* ✅ 호환 처리된 enum 전달 */}
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
                      <WalletPayment isOpen onToggle={() => toggleMethod('wallet')} dueAmount={finalAmount} />
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
                        amount={finalAmount} // ✅ TossPayment 기본 amount에도 서버 금액 반영
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

        {/* 우측 요약: PaymentInfo는 useLocation으로 표시용 총액 계산 */}
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

      {/* 지갑 비번 모달 */}
      {isPasswordModalOpen && (
        <PasswordInputModal
          onClose={() => setIsPasswordModalOpen(false)}
          onComplete={async () => {
            setIsPaying(true)
            try {
              await new Promise((r) => setTimeout(r, 700))
              // TODO: 지갑 결제 API 연동 위치
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
