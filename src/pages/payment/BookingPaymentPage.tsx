import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import WalletPayment from '@/components/payment/pay/WalletPayment'
import TossPayment, { type TossPaymentHandle } from '@/components/payment/pay/TossPayment'
import PaymentInfo from '@/components/payment/pay/PaymentInfo'
import Button from '@/components/common/button/Button'
import PasswordInputModal from '@/components/payment/modal/PasswordInputModal'
import AlertModal from '@/components/common/modal/AlertModal'
import BookingPaymentHeader from '@/components/payment/pay/BookingPaymentHeader'
import ReceiveInfo, { type ReceiveType } from '@/components/payment/delivery/ReceiveInfo'

import styles from '@pages/payment/BookingPaymentPage.module.css'

type PaymentMethod = 'wallet' | 'Toss'

async function fakePay() {
  await new Promise((resolve) => setTimeout(resolve, 700))
  const ok = Math.random() < 0.8
  const txId = Math.random().toString(36).slice(2, 10)
  return { ok, txId }
}

const DEADLINE_SECONDS = 5 * 60
const PAGE_TITLE_ID = 'bookingPaymentMainTitle'

const BookingPaymentPage: React.FC = () => {
  const navigate = useNavigate()

  const [openedMethod, setOpenedMethod] = useState<PaymentMethod | null>(null)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isTimeUpModalOpen, setIsTimeUpModalOpen] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [receiveType] = useState<ReceiveType>('QR')

  const amount = 157000
  const orderName = '예매 결제'
  const tossRef = useRef<TossPaymentHandle>(null)

  const [remainingSeconds, setRemainingSeconds] = useState(DEADLINE_SECONDS)
  useEffect(() => {
    if (DEADLINE_SECONDS <= 0) {
      setRemainingSeconds(0)
      setIsTimeUpModalOpen(true)
      return
    }

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

  const handleTimeUpModalClose = useCallback(() => {
    navigate('/')
  }, [navigate])

  const routeToResult = useCallback(
    (ok: boolean) => {
      const params = new URLSearchParams({ type: 'booking', status: ok ? 'success' : 'fail' })
      navigate(`/payment/result?${params.toString()}`)
    },
    [navigate],
  )

  const toggleMethod = useCallback(
    (m: PaymentMethod) => {
      if (isPaying || remainingSeconds <= 0) return
      setOpenedMethod((prev) => (prev === m ? null : m))
      setErr(null)
    },
    [isPaying, remainingSeconds],
  )

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

    if (openedMethod === 'wallet') {
      setIsPasswordModalOpen(true)
      return
    }

    if (openedMethod === 'Toss') {
      setIsPaying(true)
      try {
        await tossRef.current?.requestPay()
      } catch (e) {
        console.error(e)
        setErr('결제 요청 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.')
        routeToResult(false)
      } finally {
        setIsPaying(false)
      }
    }
  }, [openedMethod, isPaying, remainingSeconds, routeToResult])

  const canPay = !!openedMethod && !isPaying && remainingSeconds > 0
  const timeString = `${String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:${String(
    remainingSeconds % 60,
  ).padStart(2, '0')}`

  return (
    <div className={styles.page}>
      <BookingPaymentHeader timeString={timeString} />

      <div className={styles['booking-container']} role="main" aria-labelledby={PAGE_TITLE_ID}>
        <h1 id={PAGE_TITLE_ID} className="sr-only">예매 결제</h1>

        <div className={styles['left-panel']}>
          <section className={styles.section}>
            <div className={styles.sectionGroup}>
              <div className={styles.subSection}>
                <ReceiveInfo value={receiveType} />
              </div>

              <div className={styles.subSection}>
                <h2 id="paymentTitle" className={styles.title}>결제 수단</h2>

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
                        aria-hidden={true}
                        className={`${styles.radio} ${openedMethod === 'wallet' ? styles.radioOn : ''}`}
                      />
                      <img src="/src/shared/assets/pay_logo.png" alt="" className={styles.methodIcon} />
                      <span className={styles.methodTitle}>킷페이</span>
                      <span className={styles.methodSub}>포인트로 즉시 결제</span>
                    </div>
                    <span className={styles.chevron} aria-hidden={true}>▾</span>
                  </button>

                  <div id="wallet-panel" className={styles.methodBody} hidden={openedMethod !== 'wallet'}>
                    <WalletPayment
                      isOpen={openedMethod === 'wallet'}
                      onToggle={() => toggleMethod('wallet')}
                      dueAmount={amount}
                    />
                  </div>
                </article>

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
                        aria-hidden={true}
                        className={`${styles.radio} ${openedMethod === 'Toss' ? styles.radioOn : ''}`}
                      />
                      <img src="/src/shared/assets/Toss_Symbol_Primary.png" alt="" className={styles.methodIcon} />
                      <span className={styles.methodTitle}>토스 페이먼츠</span>
                      <span className={styles.methodSub}>신용/체크/간편결제</span>
                    </div>
                    <span className={styles.chevron} aria-hidden={true}>▾</span>
                  </button>

                  <div id="toss-panel" className={styles.methodBody} hidden={openedMethod !== 'Toss'}>
                    <TossPayment
                      ref={tossRef}
                      isOpen={openedMethod === 'Toss'}
                      onToggle={() => toggleMethod('Toss')}
                      amount={amount}
                      orderName={orderName}
                      redirectUrl={`${window.location.origin}/payment/result?type=booking`}
                    />
                  </div>
                </article>

                {err && (
                  <p className={styles.errorMsg} role="alert">
                    {err}
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>

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
