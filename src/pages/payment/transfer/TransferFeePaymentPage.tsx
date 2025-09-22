// src/pages/payment/TransferFeePaymentPage.tsx
// 목적: 양도 수수료 결제 페이지 — 주문서 state 검증 → 10% 수수료 계산 → 비밀번호 입력 → tekcitpay로 결제 → 바로 결과 페이지 이동

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import styles from './TransferFeePaymentPage.module.css'
import Button from '@/components/common/button/Button'
import ConfirmModal from '@/components/common/modal/AlertModal'
import PasswordInputModal from '@/components/payment/modal/PasswordInputModal'
import Spinner from '@/components/common/spinner/Spinner'
import TransferFeeInfo from '@/components/payment/transfer/TransferFeeInfo'
import TicketInfoSection from '@/components/payment/transfer/TicketInfoSection'
import WalletPayment from '@/components/payment/pay/TekcitPay'

import { requestTekcitPay, requestPayment, type PaymentRequestDTO } from '@/shared/api/payment/payments'

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

// 콘솔 로깅 유틸
const TAG = 'TransferFeePaymentPage'
const log = {
  info: (...a: any[]) => console.log(`[${TAG}]`, ...a),
  debug: (...a: any[]) => console.debug(`[${TAG}]`, ...a),
  warn: (...a: any[]) => console.warn(`[${TAG}]`, ...a),
  error: (...a: any[]) => console.error(`[${TAG}]`, ...a),
}

const TransferFeePaymentPage: React.FC = () => {
  // 모달 및 UI 상태
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isAgreed, setIsAgreed] = useState<boolean>(false)
  const [isPaying, setIsPaying] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    log.info('Mounted')
    log.debug('Location.state:', location.state)
    return () => log.info('Unmounted')
    // location.state는 바뀔 일이 거의 없지만, 안전을 위해 deps에서 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 주문서(TransferPaymentPage)에서 전달한 state 읽기
  const nav = (location.state ?? {}) as Partial<TransferFeeNavState>
  const product = nav.product
  log.debug('Parsed nav:', nav)

  // 로그인 사용자 정보/ID 확보
  const authUser = useAuthStore.getState()?.user as any
  const userId = useMemo(() => {
    const v = authUser?.userId ?? authUser?.id
    const n = Number(v)
    const result = Number.isFinite(n) && n > 0 ? n : 0
    log.debug('Computed userId:', { raw: v, userId: result })
    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.userId, authUser?.id])

  // paymentId는 페이지 수명주기에 1회 생성(변하지 않도록 ref)
  const paymentIdRef = useRef<string>(
    typeof _createPaymentId === 'function'
      ? _createPaymentId()
      : `fee_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  )
  const paymentId = paymentIdRef.current
  log.debug('Initialized paymentId:', paymentId)

  // 필수 데이터가 없으면 안전하게 되돌리기
  if (!product || !nav.reservationNumber) {
    log.warn('Invalid navigation state. product or reservationNumber missing.', {
      hasProduct: !!product,
      reservationNumber: nav.reservationNumber,
    })
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>양도 수수료 결제</h1>
        <p>잘못된 접근입니다. 이전 페이지에서 다시 시도해 주세요.</p>
        <Button onClick={() => navigate(-1)}>뒤로가기</Button>
      </div>
    )
  }

  // 총 금액 = 가격 × 매수
  const totalAmount = useMemo(() => {
    const value = (product.price ?? 0) * (product.ticket ?? 1)
    log.debug('Computed totalAmount:', {
      price: product.price,
      ticket: product.ticket,
      totalAmount: value,
    })
    return value
  }, [product.price, product.ticket])

  // 수수료 = 총액의 10% (원단위 반올림)
  const totalFee = useMemo(() => {
    const fee = Math.round(totalAmount * 0.1)
    log.debug('Computed totalFee(10% round):', { totalAmount, totalFee: fee })
    return fee
  }, [totalAmount])

  // 결과 페이지 이동 헬퍼
  const routeToResult = useCallback(
    (ok: boolean, extra?: Record<string, string | undefined>) => {
      const params = new URLSearchParams({
        type: 'transfer-fee',
        status: ok ? 'success' : 'fail',
        ...(extra ?? {}),
      })
      const url = `/payment/result?${params.toString()}`
      log.info('Navigate to result:', { ok, url, extra })
      navigate(url)
    },
    [navigate],
  )

  // 결제 버튼 클릭 → 확인 모달 오픈
  const handlePayment = () => {
    log.info('Click pay button', { isAgreed, isPaying })
    if (!isAgreed || isPaying) return
    setIsConfirmModalOpen(true)
    log.debug('Open confirm modal')
  }

  // 확인 모달 → 비밀번호 모달
  const handleConfirm = () => {
    log.info('Confirm payment in modal')
    setIsConfirmModalOpen(false)
    setIsPasswordModalOpen(true)
    log.debug('Close confirm modal, open password modal')
  }
  const handleCancel = () => {
    log.info('Cancel payment in modal')
    setIsConfirmModalOpen(false)
    log.debug('Close confirm modal')
  }

  // 비밀번호 입력 완료 → tekcitpay로 수수료 결제만 수행
  const handlePasswordComplete = async (password: string) => {
    log.info('Password complete', { masked: `${'*'.repeat(password.length)}` })
    setIsPasswordModalOpen(false)
    setIsPaying(true)

    // 1) 결제 요청 생성 DTO — 서버가 결제 식별 및 금액을 인지하도록 선등록
    const paymentReq: PaymentRequestDTO = {
      paymentId,                               // 현재 페이지에서 생성한 paymentId
      bookingId: nav.reservationNumber,        // 예약번호
      festivalId: null,                         // 필요 없으면 null
      paymentRequestType: 'POINT_PAYMENT_REQUESTED', // 포인트 결제 요청
      buyerId: userId,                          // 선택 필드지만 넣어도 무방
      sellerId: 1,     // 필요 시 전달, 아니면 0
      amount: totalFee,                         // 수수료 금액(원)
      currency: 'KRW',
      payMethod: 'POINT_PAYMENT',
    }

    log.debug('Submitting payment request...', paymentReq)

    try {
      // 1단계: 결제 요청 생성
      await requestPayment(paymentReq, userId)
      log.info('paymentorder에 결제 요청 생성됨', { paymentId })

      // 2단계: tekcitpay 포인트 차감
      log.debug('테킷 페이 차감됨', { paymentId, amount: totalFee })
      await requestTekcitPay(
        { amount: totalFee, paymentId, password },
        userId,
      )
      log.info('테킷 페이 결제 성공됨', { paymentId, amount: totalFee })

      setIsPaying(false)
      routeToResult(true, { paymentId })
    } catch (e: any) {
      // 실패 시 상세 로그
      log.error('수수료 결제 실패함', {
        step: e?.response?.status === 404 ? 'route_or_payment_not_found' : 'unknown',
        message: e?.message,
        code: e?.code,
        status: e?.response?.status,
        statusText: e?.response?.statusText,
        data: e?.response?.data,
        url: e?.config?.url,
        method: e?.config?.method,
        baseURL: e?.config?.baseURL,
      })
      setIsPaying(false)
      routeToResult(false, { paymentId })
    }
  }

  // UX 추적용 로그: 동의 체크 변화
  useEffect(() => {
    log.debug('Agreement changed:', isAgreed)
  }, [isAgreed])

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
            <WalletPayment
              isOpen={true}
              onToggle={() => {
                log.debug('WalletPayment toggle pressed (no-op)')
              }}
              dueAmount={totalFee}
            />
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
              onChange={(e) => {
                setIsAgreed(e.target.checked)
              }}
            />
            <span>(필수) 양도 서비스 이용약관 및 개인정보 수집 및 이용에 동의합니다.</span>
          </label>
        </section>

        {/* 결제 버튼 */}
        {isPaying &&<Spinner />}
        <div className={styles.buttonWrapper}>
          <Button
            className="w-full h-12"
            disabled={!isAgreed || isPaying}
            onClick={handlePayment}
          >
            {isPaying ? '수수료 결제하기' : '수수료 결제하기'}
          </Button>
        </div>
      </div>

      {/* 확인 모달 */}
      {isConfirmModalOpen && (
        <ConfirmModal
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        >
          양도 수수료 결제를 진행하시겠습니까?
        </ConfirmModal>
      )}

      {/* 비밀번호 입력 모달 */}
      {isPasswordModalOpen && (
        <PasswordInputModal
          onComplete={handlePasswordComplete}
          onClose={() => {
            log.info('Close password modal')
            setIsPasswordModalOpen(false)
          }}
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
