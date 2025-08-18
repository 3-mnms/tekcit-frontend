// 💰 예매 결제 페이지 멍
// - 상단 헤더는 BookingPaymentHeader로 분리 멍
// - 기존 로직(타이머, 결제 처리, 모달 등)은 동일 멍

import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import WalletPayment from '@/components/payment/pay/WalletPayment'
import TossPayment, { type TossPaymentHandle } from '@/components/payment/pay/TossPayment'
import PaymentInfo from '@/components/payment/pay/PaymentInfo'
import Button from '@/components/common/button/Button'
import PasswordInputModal from '@/pages/payment/modal/PasswordInputModal'
import AlertModal from '@/pages/payment/modal/AlertModal'
import BookingPaymentHeader from '@/components/payment/pay/BookingPaymentHeader'

import styles from '@pages/payment/BookingPaymentPage.module.css'

type PaymentMethod = 'wallet' | 'Toss'

// 💡 테스트용 결제 시뮬레이션 함수 멍
async function fakePay() {
  await new Promise((resolve) => setTimeout(resolve, 700))
  const ok = Math.random() < 0.8
  const txId = Math.random().toString(36).slice(2, 10)
  return { ok, txId }
}

const DEADLINE_SECONDS = 5 * 60 // 기본 남은 시간(초) 멍

const BookingPaymentPage: React.FC = () => {
  const navigate = useNavigate()
  const [openedMethod, setOpenedMethod] = useState<PaymentMethod | null>(null)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isTimeUpModalOpen, setIsTimeUpModalOpen] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // 결제 금액/주문명 멍
  const amount = 157000
  const orderName = '예매 결제'
  const tossRef = useRef<TossPaymentHandle>(null)

  // 타이머 상태 멍 (setInterval 1회만 생성)
  const [remainingSeconds, setRemainingSeconds] = useState(DEADLINE_SECONDS)
  useEffect(() => {
    // 이미 만료된 경우 즉시 모달 오픈 멍
    if (remainingSeconds <= 0) {
      setIsTimeUpModalOpen(true)
      return
    }
    // 인터벌 1회 생성 멍
    const id = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          setIsTimeUpModalOpen(true) // 0초 도달 시 모달 오픈 멍
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id) // 언마운트/리렌더 클린업 멍
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 만료 모달 닫기 시 이동 멍
  const handleTimeUpModalClose = () => {
    navigate('/') // TODO: 실제 예매 시작 경로로 변경 멍
  }

  // 결과 페이지로 라우팅 헬퍼 멍
  const routeToResult = useCallback(
    (ok: boolean) => {
      const params = new URLSearchParams({ type: 'booking', status: ok ? 'success' : 'fail' })
      navigate(`/payment/result?${params.toString()}`)
    },
    [navigate],
  )

  // 결제수단 아코디언 토글 멍
  const toggleMethod = useCallback((m: PaymentMethod) => {
    // 결제 중/시간만료 시 수단 변경 방지(중복 결제 방지) 멍
    if (isPaying || remainingSeconds <= 0) return
    setOpenedMethod((prev) => (prev === m ? null : m))
    setErr(null)
  }, [isPaying, remainingSeconds])

  // 결제 실행 멍
  const handlePayment = useCallback(async () => {
    if (!openedMethod) {
      setErr('결제 수단을 선택해 주세요.')
      return
    }
    if (remainingSeconds <= 0) {
      setErr('결제 시간이 만료되었어요. 다시 시도해 주세요.')
      setIsTimeUpModalOpen(true)
      return
    }
    if (isPaying) return

    setErr(null)

    // 지갑 결제: 비밀번호 입력 → 처리 멍
    if (openedMethod === 'wallet') {
      setIsPasswordModalOpen(true)
      return
    }

    // 토스 결제 멍
    if (openedMethod === 'Toss') {
      setIsPaying(true)
      try {
        await tossRef.current?.requestPay() // 리디렉트 후 ResultPage로 복귀 멍
      } catch (e) {
        console.error(e)
        setErr('결제 요청 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.')
        routeToResult(false)
      } finally {
        setIsPaying(false)
      }
    }
  }, [openedMethod, isPaying, remainingSeconds, routeToResult])

  // 결제 가능 조건: 수단 선택 + 결제 중 아님 + 남은 시간 존재 멍
  const canPay = !!openedMethod && !isPaying && remainingSeconds > 0

  // 남은 시간 포맷(MM:SS) 멍
  const timeString = `${String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:${String(
    remainingSeconds % 60,
  ).padStart(2, '0')}`

  return (
    <div className={styles.page}>
      {/* ⛳ 상단 고정 헤더: 분리된 컴포넌트 사용 멍 */}
      <BookingPaymentHeader timeString={timeString} />

      <div className={styles['booking-container']} role="main" aria-labelledby="paymentTitle">
        {/* ▶ 좌측: 결제수단 아코디언 멍 */}
        <div className={styles['left-panel']}>
          <section className={styles['section']}>
            <h2 id="paymentTitle" className={styles['section-title']}>결제 수단</h2>

            {/* 지갑 결제 멍 */}
            <article
              className={styles.methodCard}
              data-state={openedMethod === 'wallet' ? 'open' : 'closed'}
              aria-expanded={openedMethod === 'wallet'}
            >
              <button
                type="button"
                className={styles.methodHeader}
                onClick={() => toggleMethod('wallet')}
                aria-controls="wallet-panel"
                aria-pressed={openedMethod === 'wallet'}
              >
                <div className={styles.methodMeta}>
                  <span
                    aria-hidden
                    className={`${styles.radio} ${openedMethod === 'wallet' ? styles.radioOn : ''}`}
                  />
                  <img src="/src/shared/assets/pay_logo.png" alt="" className={styles.methodIcon} />
                  <span className={styles.methodTitle}>킷페이</span>
                  <span className={styles.methodSub}>포인트로 즉시 결제</span>
                </div>
                <span className={styles.chevron} aria-hidden>▾</span>
              </button>

              <div id="wallet-panel" className={styles.methodBody} hidden={openedMethod !== 'wallet'}>
                <WalletPayment
                  isOpen={openedMethod === 'wallet'}
                  onToggle={() => toggleMethod('wallet')}
                  dueAmount={amount}
                />
              </div>
            </article>

            {/* 토스 결제 멍 */}
            <article
              className={styles.methodCard}
              data-state={openedMethod === 'Toss' ? 'open' : 'closed'}
              aria-expanded={openedMethod === 'Toss'}
            >
              <button
                type="button"
                className={styles.methodHeader}
                onClick={() => toggleMethod('Toss')}
                aria-controls="toss-panel"
                aria-pressed={openedMethod === 'Toss'}
              >
                <div className={styles.methodMeta}>
                  <span
                    aria-hidden
                    className={`${styles.radio} ${openedMethod === 'Toss' ? styles.radioOn : ''}`}
                  />
                  <img src="/src/shared/assets/Toss_Symbol_Primary.png" alt="" className={styles.methodIcon} />
                  <span className={styles.methodTitle}>토스 페이먼츠</span>
                  <span className={styles.methodSub}>신용/체크/간편결제</span>
                </div>
                <span className={styles.chevron} aria-hidden>▾</span>
              </button>

              <div id="toss-panel" className={styles.methodBody} hidden={openedMethod !== 'Toss'}>
                <TossPayment
                  ref={tossRef}
                  isOpen={openedMethod === 'Toss'}
                  onToggle={() => toggleMethod('Toss')}
                  amount={amount}
                  orderName={orderName}
                  // ⚠️ 민감 식별자는 서버/세션에 보관, URL에는 상태만 유지 멍
                  redirectUrl={`${window.location.origin}/payment/result?type=booking`}
                />
              </div>
            </article>

            {err && (
              <p className={styles.errorMsg} role="alert">
                {err}
              </p>
            )}
          </section>
        </div>

        {/* ▶ 우측: 주문 요약/결제 버튼 멍 */}
        <aside className={styles['right-panel']} aria-label="주문 요약">
          <div className={styles['payment-summary-wrapper']}>
            <PaymentInfo />
          </div>

          <div className={styles['pay-button-wrapper']}>
            <Button
              type="button"
              className={styles['pay-button']}
              onClick={handlePayment}
              disabled={!canPay}
              aria-disabled={!canPay}
              aria-busy={isPaying}
            >
              {isPaying ? '결제 중…' : '결제하기'}
            </Button>

            <p className={styles.terms}>
              결제 진행 시 <a href="/terms" target="_blank" rel="noopener">이용약관</a> 및
              <a href="/privacy" target="_blank" rel="noopener"> 개인정보처리방침</a>에 동의하는 것으로 간주됩니다
            </p>
          </div>
        </aside>
      </div>

      {/* 🔐 지갑 비밀번호 모달 멍 */}
      {isPasswordModalOpen && (
        <PasswordInputModal
          onClose={() => setIsPasswordModalOpen(false)}
          onComplete={async () => {
            setIsPaying(true)
            try {
              const r = await fakePay()
              routeToResult(r.ok)
            } finally {
              setIsPaying(false)
              setIsPasswordModalOpen(false)
            }
          }}
        />
      )}

      {/* ⏰ 시간 만료 모달 멍 */}
      {isTimeUpModalOpen && (
        <AlertModal
          title="시간 만료"
          onConfirm={handleTimeUpModalClose}
          onCancel={handleTimeUpModalClose}
        >
          결제 시간이 만료되었습니다. 다시 시도해 주세요.
        </AlertModal>
      )}
    </div>
  )
}

export default BookingPaymentPage
