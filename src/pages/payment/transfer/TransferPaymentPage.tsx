import { useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import AddressForm from '@/components/payment/address/AddressForm'
import BookingProductInfo from '@/components/payment/BookingProductInfo'
import Button from '@/components/common/button/Button'
import AlertModal from '@/pages/payment/modal/AlertModal'
import PasswordInputModal from '@/pages/payment/modal/PasswordInputModal'

import WalletPayment from '@/components/payment/pay/WalletPayment'
import TossPayment, { type TossPaymentHandle } from '@/components/payment/pay/TossPayment'

import styles from './TransferPaymentPage.module.css'

type Method = '킷페이' | '토스'

const TransferPaymentPage: React.FC = () => {
  const [isAddressFilled, setIsAddressFilled] = useState(false)
  const [isAgreed, setIsAgreed] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<Method | ''>('')
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [isPwModalOpen, setIsPwModalOpen] = useState(false)

  const navigate = useNavigate()
  const tossRef = useRef<TossPaymentHandle>(null)

  const amount = 190000
  const orderName = '양도 결제'

  // ✅ 공통 결과 페이지 이동 헬퍼 멍
  const routeToResult = useCallback(
    (ok: boolean, extra?: Record<string, string | undefined>) => {
      const params = new URLSearchParams({
        type: 'transfer',                 // 이 페이지는 양도 결제 멍
        status: ok ? 'success' : 'fail',
        ...(extra ?? {}),
      })
      navigate(`/payment/result?${params.toString()}`)
    },
    [navigate],
  )

  // 다음 버튼 클릭
  const handleNextClick = async () => {
    if (!isAddressFilled || !isAgreed || !selectedMethod) return

    if (selectedMethod === '킷페이') {
      setIsAlertOpen(true)
      return
    }

    if (selectedMethod === '토스') {
      await tossRef.current?.requestPay() // redirectUrl로 ResultPage 이동
    }
  }

  const handleAlertConfirm = () => {
    setIsAlertOpen(false)
    setIsPwModalOpen(true)
  }
  const handleAlertCancel = () => setIsAlertOpen(false)

  // 킷페이(지갑) 비밀번호 완료 시 후처리
  const handlePasswordComplete = (password: string) => {
    console.log('입력된 비밀번호:', password)
    setIsPwModalOpen(false)
    // TODO: 지갑 포인트 차감/거래 기록 반영 API 연동
    const ok = Math.random() < 0.9 // 예시용
    const txId = Math.random().toString(36).slice(2, 10)
    routeToResult(ok, { txId })
  }

  const disabledNext = !(isAddressFilled && isAgreed && selectedMethod !== '')

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>양도 주문서</h1>

      {/* 예매 정보 */}
      <section className={styles.productSection}>
        <h2 className={styles.sectionTitle}>예매 기본 안내사항</h2>
        <BookingProductInfo />
      </section>

      {/* 배송지 입력 */}
      <section className={styles.section}>
        <AddressForm onValidChange={setIsAddressFilled} />
      </section>

      {/* 결제 수단 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>결제 수단</h2>
        <WalletPayment
          isOpen={selectedMethod === '킷페이'}
          onToggle={() => setSelectedMethod('킷페이')}
        />
        <TossPayment
          ref={tossRef}
          isOpen={selectedMethod === '토스'}
          onToggle={() => setSelectedMethod('토스')}
          amount={amount}
          orderName={orderName}
          // ✅ 양도 결제 전용 결과 페이지 쿼리 멍
          redirectUrl={`${window.location.origin}/payment/result?type=transfer`}
        />
      </section>

      {/* 결제 요약 */}
      <section className={styles.priceSummary}>
        <div className={styles.priceRow}>
          <span>티켓 가격</span>
          <span>{amount.toLocaleString()}원</span>
        </div>
        <div className={styles.priceTotal}>
          <strong>총 결제 금액</strong>
          <strong>{amount.toLocaleString()}원</strong>
        </div>
      </section>

      {/* 약관 동의 */}
      <section className={styles.section}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
          />
          <span className={styles.checkboxText}>
            (필수) 양도 서비스 이용약관 및 개인정보 수집 및 이용에 동의합니다.
          </span>
        </label>
      </section>

      {/* 다음 버튼 */}
      <Button
        onClick={handleNextClick}
        disabled={disabledNext}
        className="w-full h-12 bg-blue-500 text-white text-lg font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        다음
      </Button>

      {/* 안내 모달 */}
      {isAlertOpen && (
        <AlertModal title="결제 안내" onCancel={handleAlertCancel} onConfirm={handleAlertConfirm}>
          양도로 구매한 티켓은 환불 불가합니다. 결제 하시겠습니까?
        </AlertModal>
      )}

      {/* 킷페이 비밀번호 입력 모달 */}
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
