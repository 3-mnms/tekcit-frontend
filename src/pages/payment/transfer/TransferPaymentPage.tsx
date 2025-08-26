import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import AddressForm from '@/components/payment/address/AddressForm'
import BookingProductInfo from '@/components/payment/BookingProductInfo'
import Button from '@/components/common/button/Button'
import AlertModal from '@/components/common/modal/AlertModal'
import PasswordInputModal from '@/components/payment/modal/PasswordInputModal'
import WalletPayment from '@/components/payment/pay/WalletPayment'

import styles from './TransferPaymentPage.module.css' // ✅ CSS 모듈

type Method = '킷페이' | '토스'

const TransferPaymentPage: React.FC = () => {
  const navigate = useNavigate()

  // ✅ 상태들
  const [isAddressFilled, setIsAddressFilled] = useState(false) // 배송지 폼 유효성 여부
  const [isAgreed, setIsAgreed] = useState(false)               // 약관 동의 여부
  const [openedMethod, setOpenedMethod] = useState<Method | null>(null) // 펼친 결제수단
  const [isAlertOpen, setIsAlertOpen] = useState(false)         // 안내 모달
  const [isPwModalOpen, setIsPwModalOpen] = useState(false)     // 비번 입력 모달

  const amount = 190000 // ✅ 총 결제금액(예시)

  // ✅ 다음 버튼 비활성 조건 계산
  const disabledNext = useMemo(
    () => !(isAddressFilled && isAgreed && openedMethod !== null),
    [isAddressFilled, isAgreed, openedMethod]
  )

  // ✅ 결과 페이지 이동 헬퍼
  const routeToResult = (ok: boolean, extra?: Record<string, string | undefined>) => {
    const params = new URLSearchParams({
      type: 'transfer',
      status: ok ? 'success' : 'fail',
      ...(extra ?? {}),
    })
    navigate(`/payment/result?${params.toString()}`)
  }

  // ✅ 결제수단 토글
  const toggleMethod = (m: Method) => {
    setOpenedMethod(prev => (prev === m ? null : m))
  }

  // ✅ 모달 핸들러
  const handleAlertConfirm = () => {
    setIsAlertOpen(false)
    setIsPwModalOpen(true)
  }
  const handleAlertCancel = () => setIsAlertOpen(false)

  // ✅ 비밀번호 입력 완료 → 결제 시뮬레이션
  const handlePasswordComplete = (password: string) => {
    console.log('[KitPay] 입력 비밀번호:', password)
    setIsPwModalOpen(false)
    const ok = Math.random() < 0.9
    const txId = Math.random().toString(36).slice(2, 10)
    routeToResult(ok, { txId })
  }

  return (
    <div className={styles.page}>
      {/* 상단 헤더 */}
      <header className={styles.header}>
        <h1 className={styles.title}>양도 주문서</h1>
      </header>

      {/* ✅ 메인 2열 레이아웃: 좌측 입력 / 우측 요약(sticky) */}
      <div className={styles.layout}>
        <main className={styles.main}>
          <section className={styles.card}>
            <BookingProductInfo />
          </section>

          {/* 배송지 폼 */}
          <section className={styles.card}>
            <AddressForm onValidChange={setIsAddressFilled} />
          </section>

          {/* 결제 수단 */}
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
                    <WalletPayment isOpen onToggle={() => toggleMethod('킷페이')} dueAmount={amount} />
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>

        {/* ───────────── 오른쪽: 요약 + CTA (sticky) ───────────── */}
        <aside className={styles.sidebar}>
          <div className={styles.sticky}>
            {/* 결제 요약 카드 */}
            <section className={`${styles.card} ${styles.summaryCard}`} aria-label="결제 요약">
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

              {/* 약관 동의(요약 카드 내에 배치) */}
              <label className={styles.agree}>
                <input
                  type="checkbox"
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                  aria-label="양도 서비스 약관 동의"
                />
                <span>(필수) 양도 서비스 이용약관 및 개인정보 수집·이용에 동의합니다.</span>
              </label>

              {/* 다음 버튼 (항상 우측 고정 카드 하단에서 노출) */}
              <Button
                disabled={disabledNext}
                className={styles.nextBtn}
                aria-disabled={disabledNext}
                aria-label="다음 단계로 이동"
                onClick={() => setIsAlertOpen(true)} // ✅ 예시: 안내 후 비밀번호 모달
              >
                다음
              </Button>
            </section>
          </div>
        </aside>
      </div>

      {/* 모달들 */}
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
