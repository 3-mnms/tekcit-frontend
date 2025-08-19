// ✅ UI 개선: 카드 레이아웃, 결제수단 세그먼트 탭, 하단 고정 CTA 바 적용 멍
import { useRef, useState, useCallback } from 'react'
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
  // ✅ 폼 상태 멍
  const [isAddressFilled, setIsAddressFilled] = useState(false)
  const [isAgreed, setIsAgreed] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<Method | ''>('')

  // ✅ 모달 상태 멍
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [isPwModalOpen, setIsPwModalOpen] = useState(false)

  // ✅ 네비/결제 위젯 참조 멍
  const navigate = useNavigate()
  const tossRef = useRef<TossPaymentHandle>(null)

  // ✅ 금액/주문명은 실제 데이터 연동 시 교체 멍
  const amount = 190000
  const orderName = '양도 결제'

  // ✅ 공통 결과 페이지 이동 헬퍼 멍
  const routeToResult = useCallback(
    (ok: boolean, extra?: Record<string, string | undefined>) => {
      const params = new URLSearchParams({
        type: 'transfer', // 양도 결제 멍
        status: ok ? 'success' : 'fail',
        ...(extra ?? {}),
      })
      navigate(`/payment/result?${params.toString()}`)
    },
    [navigate],
  )

  // ✅ 다음 버튼 클릭 멍
  const handleNextClick = async () => {
    if (!isAddressFilled || !isAgreed || !selectedMethod) return

    if (selectedMethod === '킷페이') {
      // 지갑 결제는 비밀번호 확인 → 차감 처리 흐름 멍
      setIsAlertOpen(true)
      return
    }

    if (selectedMethod === '토스') {
      // 토스는 위젯에서 결제 요청 → redirectUrl로 ResultPage 이동 멍
      await tossRef.current?.requestPay()
    }
  }

  // ✅ 세그먼트 탭 핸들러 멍
  const chooseMethod = (m: Method) => setSelectedMethod(m)

  // ✅ 안내 모달 버튼 멍
  const handleAlertConfirm = () => {
    setIsAlertOpen(false)
    setIsPwModalOpen(true)
  }
  const handleAlertCancel = () => setIsAlertOpen(false)

  // ✅ 킷페이(지갑) 비밀번호 완료 시 후처리 멍
  const handlePasswordComplete = (password: string) => {
    console.log('입력된 비밀번호:', password) // 실제론 검증/차감 API 호출 멍
    setIsPwModalOpen(false)
    const ok = Math.random() < 0.9 // 데모용 결과 멍
    const txId = Math.random().toString(36).slice(2, 10)
    routeToResult(ok, { txId })
  }

  // ✅ 다음 버튼 비활성 조건 멍
  const disabledNext = !(isAddressFilled && isAgreed && selectedMethod !== '')

  return (
    <div className={styles.page}>
      {/* 헤더 멍 */}
      <header className={styles.header}>
        <h1 className={styles.title}>양도 주문서</h1>
      </header>

      {/* 예매 정보 카드 멍 */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>예매 기본 안내사항</h2>
        <BookingProductInfo />
      </section>

      {/* 배송지 카드 멍 */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>배송지 선택</h2>
        <AddressForm onValidChange={setIsAddressFilled} />
      </section>

      {/* 결제 수단 카드 멍 */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>결제 수단</h2>

        {/* ▼ 카드 라디오 방식으로 선택 멍 (접근성: radiogroup/radio + 키보드 지원) */}
        <div className={styles.methodList} role="radiogroup" aria-label="결제 수단">
          {/* 킷페이 카드 멍 */}
          <div
            role="radio"
            aria-checked={selectedMethod === '킷페이'}
            tabIndex={0}
            className={`${styles.methodCard} ${selectedMethod === '킷페이' ? styles.active : ''}`}
            onClick={() => chooseMethod('킷페이')}
            onKeyDown={(e) => {
              // 엔터/스페이스로 선택 지원 멍
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                chooseMethod('킷페이')
              }
            }}
          >
            <div className={styles.methodLeft}>
              <div className={styles.methodTitle}>킷페이</div>
              <div className={styles.methodDesc}>잔액 0원</div> {/* ← 실제 잔액 연동 가능 멍 */}
            </div>
            <span
              aria-hidden
              className={`${styles.radio} ${selectedMethod === '킷페이' ? styles.radioOn : ''}`}
            />
          </div>

          {/* 토스 페이먼츠 카드 멍 */}
          <div
            role="radio"
            aria-checked={selectedMethod === '토스'}
            tabIndex={0}
            className={`${styles.methodCard} ${selectedMethod === '토스' ? styles.active : ''}`}
            onClick={() => chooseMethod('토스')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                chooseMethod('토스')
              }
            }}
          >
            <div className={styles.methodLeft}>
              <div className={styles.methodTitle}>토스 페이먼츠</div>
              <div className={styles.methodDesc}>신용/체크/간편결제</div>
            </div>
            <span
              aria-hidden
              className={`${styles.radio} ${selectedMethod === '토스' ? styles.radioOn : ''}`}
            />
          </div>
        </div>

        {/* ▼ 선택된 수단에 맞춰 위젯 렌더링 멍 */}
        <div className={styles.methodBody}>
          <WalletPayment
            isOpen={selectedMethod === '킷페이'}
            onToggle={() => chooseMethod('킷페이')}
          />
          <TossPayment
            ref={tossRef}
            isOpen={selectedMethod === '토스'}
            onToggle={() => chooseMethod('토스')}
            amount={amount}
            orderName={orderName}
            redirectUrl={`${window.location.origin}/payment/result?type=transfer`}
          />
        </div>
      </section>

      {/* 가격 요약 카드 멍 */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>결제 요약</h2>
        <div className={styles.priceRow}>
          <span>티켓 가격</span>
          <span className={styles.priceValue}>{amount.toLocaleString()}원</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.priceTotal}>
          <strong>총 결제 금액</strong>
          <strong className={styles.priceStrong}>{amount.toLocaleString()}원</strong>
        </div>
      </section>

      {/* 하단 고정 CTA 바: 약관 + 총액 + 다음 버튼 멍 */}
      <footer className={styles.ctaBar}>
        <label className={styles.agree}>
          <input
            type="checkbox"
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
          />
          <span>(필수) 양도 서비스 이용약관 및 개인정보 수집·이용에 동의합니다.</span>
        </label>

        <div className={styles.ctaRight}>
          <div className={styles.inlineTotal}>
            <div className={styles.inlineTotal}>
              <span>총 결제 금액</span>
              <strong>{amount.toLocaleString()}원</strong>
            </div>
          </div>
          <Button
            onClick={handleNextClick}
            disabled={disabledNext}
            className={styles.nextBtn}
          >
            다음
          </Button>
        </div>
      </footer>

      {/* 안내 모달 멍 */}
      {isAlertOpen && (
        <AlertModal title="결제 안내" onCancel={handleAlertCancel} onConfirm={handleAlertConfirm}>
          양도로 구매한 티켓은 환불 불가합니다 멍 결제 하시겠습니까?
        </AlertModal>
      )}

      {/* 킷페이 비밀번호 입력 모달 멍 */}
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
