import { useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import AddressForm from '@/components/payment/address/AddressForm'
import BookingProductInfo from '@/components/payment/BookingProductInfo'
import Button from '@/components/common/button/Button'
import AlertModal from '@/components/common/modal/AlertModal'
import PasswordInputModal from '@/components/payment/modal/PasswordInputModal'
import WalletPayment from '@/components/payment/pay/WalletPayment'
import TossPayment, { type TossPaymentHandle } from '@/components/payment/pay/TossPayment'

import styles from './TransferPaymentPage.module.css'

type Method = '킷페이' | '토스'

const TransferPaymentPage: React.FC = () => {
  const navigate = useNavigate()
  const tossRef = useRef<TossPaymentHandle>(null)

  const [isAddressFilled, setIsAddressFilled] = useState(false)
  const [isAgreed, setIsAgreed] = useState(false)
  const [openedMethod, setOpenedMethod] = useState<Method | null>(null)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [isPwModalOpen, setIsPwModalOpen] = useState(false)

  const amount = 190000

  const disabledNext = useMemo(
    () => !(isAddressFilled && isAgreed && openedMethod !== null),
    [isAddressFilled, isAgreed, openedMethod]
  )

  const routeToResult = (ok: boolean, extra?: Record<string, string | undefined>) => {
    const params = new URLSearchParams({
      type: 'transfer',
      status: ok ? 'success' : 'fail',
      ...(extra ?? {}),
    })
    navigate(`/payment/result?${params.toString()}`)
  }

  const toggleMethod = (m: Method) => {
    setOpenedMethod(prev => (prev === m ? null : m))
  }

  const handleNextClick = async () => {
    if (disabledNext) return

    if (openedMethod === '킷페이') {
      setIsAlertOpen(true)
      return
    }

    if (openedMethod === '토스') {
      await tossRef.current?.requestPay()
      return
    }
  }

  const handleAlertConfirm = () => {
    setIsAlertOpen(false)
    setIsPwModalOpen(true)
  }

  const handleAlertCancel = () => setIsAlertOpen(false)

  const handlePasswordComplete = (password: string) => {
    console.log('[KitPay] 입력 비밀번호:', password)
    setIsPwModalOpen(false)

    const ok = Math.random() < 0.9
    const txId = Math.random().toString(36).slice(2, 10)
    routeToResult(ok, { txId })
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>양도 주문서</h1>
      </header>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>예매 기본 안내사항</h2>
        <BookingProductInfo />
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>배송지 선택</h2>
        <AddressForm onValidChange={setIsAddressFilled} />
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>결제 수단</h2>
        <div className={styles.paymentBox}>
          {/* 킷페이 카드 */}
          <div className={`${styles.methodCard} ${openedMethod === '킷페이' ? styles.active : ''}`}>
            <button
              className={styles.methodHeader}
              onClick={() => toggleMethod('킷페이')}
              aria-expanded={openedMethod === '킷페이'}
            >
              <span className={`${styles.radio} ${openedMethod === '킷페이' ? styles.radioOn : ''}`} />
              <span className={styles.methodText}>킷페이 (포인트 결제)</span>
            </button>
            {openedMethod === '킷페이' && (
              <div className={styles.methodBody}>
                <WalletPayment
                  isOpen
                  onToggle={() => toggleMethod('킷페이')}
                  dueAmount={amount}
                />
              </div>
            )}
          </div>

          {/* 토스 카드 */}
          <div className={`${styles.methodCard} ${openedMethod === '토스' ? styles.active : ''}`}>
            <button
              className={styles.methodHeader}
              onClick={() => toggleMethod('토스')}
              aria-expanded={openedMethod === '토스'}
            >
              <span className={`${styles.radio} ${openedMethod === '토스' ? styles.radioOn : ''}`} />
              <span className={styles.methodText}>토스페이먼츠 (신용/체크/간편)</span>
            </button>
            {openedMethod === '토스' && (
              <div className={styles.methodBody}>
                <TossPayment
                  ref={tossRef}
                  isOpen
                  onToggle={() => toggleMethod('토스')}
                  amount={amount}
                  orderName="티켓 양도 결제"
                  redirectUrl={`${window.location.origin}/payment/result?type=transfer`}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>결제 요약</h2>
        <div className={styles.priceRow}>
          <span>티켓 가격</span>
          <span className={styles.priceValue}>{amount.toLocaleString()}원</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.priceTotal} aria-live="polite">
          <strong>총 결제 금액</strong>
          <strong className={styles.priceStrong}>{amount.toLocaleString()}원</strong>
        </div>
      </section>

      <footer className={styles.ctaBar}>
        <label className={styles.agree}>
          <input
            type="checkbox"
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
            aria-label="양도 서비스 약관 동의"
          />
          <span>(필수) 양도 서비스 이용약관 및 개인정보 수집·이용에 동의합니다.</span>
        </label>

        <div className={styles.ctaRight}>
          <div className={styles.inlineTotal}>
            <span>총 결제 금액</span>
            <strong>{amount.toLocaleString()}원</strong>
          </div>
          <Button
            onClick={handleNextClick}
            disabled={disabledNext}
            className={styles.nextBtn}
            aria-disabled={disabledNext}
            aria-label="다음 단계로 이동"
          >
            다음
          </Button>
        </div>
      </footer>

      {isAlertOpen && (
        <AlertModal title="결제 안내" onCancel={handleAlertCancel} onConfirm={handleAlertConfirm}>
          양도로 구매한 티켓은 환불 불가합니다. 계속 진행하시겠습니까?
        </AlertModal>
      )}

      {isPwModalOpen && (
        <PasswordInputModal
          onClose={() => setIsPwModalOpen(false)}
          onComplete={handlePasswordComplete}
        />
      )}
    </div>
  )
}

export default TransferPaymentPage
