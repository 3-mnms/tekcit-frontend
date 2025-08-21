// 📄 src/pages/payment/BookingPaymentPage.tsx 멍
// - 시간 만료 모달: 취소 버튼 제거, 확인만 눌러 모달 닫기 멍
// - 나머지 결제 흐름 동일 멍

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import WalletPayment from '@/components/payment/pay/WalletPayment'
import TossPayment, { type TossPaymentHandle } from '@/components/payment/pay/TossPayment'
import PaymentInfo from '@/components/payment/pay/PaymentInfo'
import Button from '@/components/common/button/Button'
import PasswordInputModal from '@/components/payment/modal/PasswordInputModal'
import AlertModal from '@/components/common/modal/AlertModal'
import BookingPaymentHeader from '@/components/payment/pay/BookingPaymentHeader'
import ReceiveInfo, { type ReceiveType } from '@/components/payment/delivery/ReceiveInfo'

import styles from './BookingPaymentPage.module.css'

// ✅ 결제수단 타입 멍
type PaymentMethod = 'wallet' | 'Toss'

// ✅ 결제 타이머(초) 멍
const DEADLINE_SECONDS = 5 * 60

// ✅ 접근성: 페이지 타이틀 id 멍
const PAGE_TITLE_ID = 'bookingPaymentMainTitle'

const BookingPaymentPage: React.FC = () => {
  const navigate = useNavigate()

  // ✅ UI/상태 멍
  const [openedMethod, setOpenedMethod] = useState<PaymentMethod | null>(null)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isTimeUpModalOpen, setIsTimeUpModalOpen] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // ✅ 수령방법: 현재 ReceiveInfo가 onChange 미지원 → 고정값 유지 멍
  const [receiveType] = useState<ReceiveType>('QR')

  // ✅ 토스 결제 ref 멍
  const tossRef = useRef<TossPaymentHandle>(null)

  // ✅ 목데이터(연동 전) 멍
  const buyerName = '홍길동'
  const festivalId = 'FSTV-2025-0921-001'
  const posterUrl = 'https://via.placeholder.com/150x200?text=포스터'
  const title = '2025 변진섭 전국투어 콘서트 : 변천 시 시즌2 -'
  const dateTimeLabel = '2025.09.21 (일) 17:00'
  const unitPrice = 110_000
  const quantity = 1

  // ✅ 배송비 계산: 'DELIVERY' 또는 'COURIER' 키워드 방어 처리 멍
  const isCourier =
    (receiveType as unknown as string) === 'DELIVERY' ||
    (receiveType as unknown as string) === 'COURIER'
  const shippingFee = isCourier ? 3_200 : 0

  // ✅ 결제 금액/주문명 멍
  const amount = unitPrice * quantity + shippingFee
  const orderName = '티켓 예매'

  // ✅ 타이머 상태 및 동작 멍
  const [remainingSeconds, setRemainingSeconds] = useState(DEADLINE_SECONDS)
  useEffect(() => {
    const id = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          setIsTimeUpModalOpen(true) // ⏰ 시간 만료 시 모달 오픈 멍
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // ✅ 시간만료 모달 확인: 모달만 닫기 멍 (이전: navigate('/'))
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

  function randomId() {
    return [...crypto.getRandomValues(new Uint32Array(2))]
      .map((word) => word.toString(16).padStart(8, '0'))
      .join('')
  }

  // ✅ 결제 실행 멍
  const handlePayment = async () => {
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

    // 👉 킷페이(지갑) 결제: 비밀번호 모달부터 멍
    if (openedMethod === 'wallet') {
      setIsPasswordModalOpen(true)
      return
    }

    // 👉 토스 결제 멍
    if (openedMethod === 'Toss') {
      setIsPaying(true)
      try {
        await tossRef.current?.requestPay()
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
              {/* ⛳ 현재 ReceiveInfo가 onChange 미지원 → onChange 전달 제거 멍 */}
              <ReceiveInfo value={receiveType} />
            </div>

            {/* 결제 수단 섹션 멍 */}
            <div>
              <h2 className={styles.sectionTitle}>결제 수단</h2>
              <section className={styles.paymentBox}>
                {/* 킷페이 멍 */}
                <div className={styles.methodCard}>
                  <button
                    className={styles.methodHeader}
                    onClick={() => toggleMethod('wallet')}
                    aria-expanded={openedMethod === 'wallet'}
                    type="button"
                  >
                    <span
                      className={
                        styles.radio + (openedMethod === 'wallet' ? ` ${styles.radioOn}` : '')
                      }
                    />
                    <span className={styles.methodText}>킷페이 (포인트 결제)</span>
                  </button>

                  {openedMethod === 'wallet' && (
                    <div className={styles.methodBody}>
                      <WalletPayment
                        isOpen
                        onToggle={() => toggleMethod('wallet')}
                        dueAmount={amount}
                      />
                    </div>
                  )}
                </div>

                {/* 토스 멍 */}
                <div className={styles.methodCard}>
                  <button
                    className={styles.methodHeader}
                    onClick={() => toggleMethod('Toss')}
                    aria-expanded={openedMethod === 'Toss'}
                    type="button"
                  >
                    <span
                      className={
                        styles.radio + (openedMethod === 'Toss' ? ` ${styles.radioOn}` : '')
                      }
                    />
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
                        // ✅ 리다이렉트 후 /payment/result?type=booking&status=... 형태로 합류하도록 서버/게이트웨이 연동 시 상태 추가 멍
                        redirectUrl={`${window.location.origin}/payment/result?type=booking`}
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
              // ✅ 목 결제 처리 멍
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
        <AlertModal
          title="시간 만료"
          onConfirm={handleTimeUpModalClose} // ✅ 확인 클릭 시 모달만 닫기 멍
          // ⛳ onCancel 미전달 → 취소 버튼 숨김 (AlertModal이 이렇게 동작하도록 구현되어 있어야 함) 멍
        >
          결제 시간이 만료되었습니다. 다시 시도해주세요.
        </AlertModal>
      )}
    </div>
  )
}

export default BookingPaymentPage
