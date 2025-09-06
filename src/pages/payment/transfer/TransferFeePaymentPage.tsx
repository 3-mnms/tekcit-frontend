// src/pages/payment/TransferFeePaymentPage.tsx
// 목적: 양도 수수료 결제 페이지 — 주문서 state 검증 → 10% 수수료 계산 → 비밀번호 입력 → tekcitpay로 결제 → 바로 결과 페이지 이동

import { useState, useCallback, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import styles from './TransferFeePaymentPage.module.css'
import Button from '@/components/common/button/Button'
import ConfirmModal from '@/components/common/modal/AlertModal'
import PasswordInputModal from '@/components/payment/modal/PasswordInputModal'

import TransferFeeInfo from '@/components/payment/transfer/TransferFeeInfo'
import TicketInfoSection from '@/components/payment/transfer/TicketInfoSection'
import WalletPayment from '@/components/payment/pay/TekcitPay'

// 포인트 결제 API만 사용
import { payByTekcitPay } from '@/shared/api/payment/payments'

import { useAuthStore } from '@/shared/storage/useAuthStore'
import { createPaymentId as _createPaymentId } from '@/models/payment/utils/paymentUtils'

// 주문서에서 넘겨주는 state 타입 정의
type TransferFeeNavState = {
  transferId?: number
  reservationNumber: string
  sellerId?: number
  product: {
    title: string
    datetime: string
    ticket: number
    price: number
  }
}

const TransferFeePaymentPage: React.FC = () => {
  // 모달 및 UI 상태
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isAgreed, setIsAgreed] = useState<boolean>(false)
  const [isPaying, setIsPaying] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  // 주문서(TransferPaymentPage)에서 전달한 state 읽기
  const nav = (location.state ?? {}) as Partial<TransferFeeNavState>
  const product = nav.product

  // 로그인 사용자 정보/ID 확보
  const authUser = useAuthStore.getState()?.user as any
  const userId = useMemo(() => {
    const v = authUser?.userId ?? authUser?.id
    const n = Number(v)
    return Number.isFinite(n) && n > 0 ? n : 0
  }, [authUser])

  // paymentId는 페이지 수명주기에 1회 생성(변하지 않도록 ref)
  const paymentIdRef = useRef<string>(
    typeof _createPaymentId === 'function'
      ? _createPaymentId()
      : `fee_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` // fallback
  )
  const paymentId = paymentIdRef.current

  // 필수 데이터가 없으면 안전하게 되돌리기
  if (!product || !nav.reservationNumber) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>양도 수수료 결제</h1>
        <p>잘못된 접근입니다. 이전 페이지에서 다시 시도해 주세요.</p>
        <Button onClick={() => navigate(-1)}>뒤로가기</Button>
      </div>
    )
  }

  // 총 금액 = 가격 × 매수
  const totalAmount = useMemo(
    () => (product.price ?? 0) * (product.ticket ?? 1),
    [product.price, product.ticket]
  )

  // 수수료 = 총액의 10% (원단위 반올림)
  const totalFee = useMemo(() => Math.round(totalAmount * 0.1), [totalAmount])

  // 결과 페이지 이동 헬퍼
  const routeToResult = useCallback(
    (ok: boolean, extra?: Record<string, string | undefined>) => {
      const params = new URLSearchParams({
        type: 'transfer-fee',
        status: ok ? 'success' : 'fail',
        ...(extra ?? {}),
      })
      navigate(`/payment/result?${params.toString()}`)
    },
    [navigate],
  )

  // 결제 버튼 클릭 → 확인 모달 오픈
  const handlePayment = () => {
    if (!isAgreed || isPaying) return
    setIsConfirmModalOpen(true)
  }

  // 확인 모달 → 비밀번호 모달
  const handleConfirm = () => {
    setIsConfirmModalOpen(false)
    setIsPasswordModalOpen(true)
  }
  const handleCancel = () => setIsConfirmModalOpen(false)

  // 비밀번호 입력 완료 → tekcitpay로 수수료 결제만 수행
  const handlePasswordComplete = async (password: string) => {
    setIsPasswordModalOpen(false)
    setIsPaying(true)

    try {
      // tekcitpay: 비밀번호 검증 + 포인트 차감
      await payByTekcitPay(
        {
          amount: totalFee,   // 수수료 금액
          paymentId,          // 결제 식별자
          password,           // 사용자 입력 비밀번호
        },
        userId                // 서버가 사용자 식별에 사용하는 값(헤더/미들웨어에서 활용)
      )

      // 결제 성공 시 바로 결과 페이지로 이동(양도 상태 업데이트/웹소켓 미사용)
      setIsPaying(false)
      routeToResult(true, { paymentId })
    } catch (e) {
      console.error('tekcitpay 결제 실패:', e)
      setIsPaying(false)
      routeToResult(false, { paymentId })
    }
  }

  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.title}>양도 수수료 결제</h1>

        {/* 티켓 정보 — 주문서에서 받은 스냅샷으로 표시 */}
        <TicketInfoSection
          title={product.title}
          date={product.datetime}
          ticket={product.ticket}
        />

        {/* 결제 수단 — 수수료 금액을 결제 예정 금액으로 전달 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>결제 수단</h2>
          <div className={styles.paymentMethodWrapper}>
            <WalletPayment isOpen={true} onToggle={() => {}} dueAmount={totalFee} />
          </div>
        </section>

        {/* 수수료 정보 — perFee와 totalFee가 동일(단일 항목) */}
        <section className={styles.feeSection}>
          <TransferFeeInfo perFee={totalFee} totalFee={totalFee} />
        </section>

        {/* 약관 동의 */}
        <section className={styles.termsSection}>
          <label className={styles.checkboxWrapper}>
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
            />
            <span>(필수) 양도 서비스 이용약관 및 개인정보 수집 및 이용에 동의합니다.</span>
          </label>
        </section>

        {/* 결제 버튼 */}
        <div className={styles.buttonWrapper}>
          <Button
            className="w-full h-12"
            disabled={!isAgreed || isPaying}
            onClick={handlePayment}
          >
            {isPaying ? '결제 중...' : '수수료 결제하기'}
          </Button>
        </div>
      </div>

      {/* 확인 모달 */}
      {isConfirmModalOpen && (
        <ConfirmModal onConfirm={handleConfirm} onCancel={handleCancel}>
          양도 수수료 결제를 진행하시겠습니까?
        </ConfirmModal>
      )}

      {/* 비밀번호 입력 모달 */}
      {isPasswordModalOpen && (
        <PasswordInputModal
          onComplete={handlePasswordComplete}
          onClose={() => setIsPasswordModalOpen(false)}
          amount={totalFee}
          paymentId={paymentId}
          userId={userId}
          userName={authUser?.name ?? authUser?.nickname}
        />
      )}
    </>
  )
}

export default TransferFeePaymentPage
