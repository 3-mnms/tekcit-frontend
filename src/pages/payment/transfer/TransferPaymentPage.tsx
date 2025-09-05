// src/pages/payment/TransferPaymentPage.tsx
// 목적: 양도 결제 페이지. 가족(FAMILY)은 무료 처리, 지인(OTHERS)은 킷페이 결제 진행
// 흐름: 다음 클릭 → 양도 승인(가족/지인 분기) → (지인) 결제 요청 생성 → 비밀번호 모달에서 /api/tekcitpay 성공 → alert 확인 → 수수료 결제 페이지로 이동(+표시용 스냅샷 state 전달)

import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import BookingProductInfo from '@/components/payment/BookingProductInfo'
import AddressForm from '@/components/payment/address/AddressForm'
import Button from '@/components/common/button/Button'
import AlertModal from '@/components/common/modal/AlertModal'
import PasswordInputModal from '@/components/payment/modal/PasswordInputModal'
import WalletPayment from '@/components/payment/pay/TekcitPay'
import TicketDeliverySelectSection, { type DeliveryMethod } from '@/components/booking/TicketDeliverySelectSection'

import { useRespondFamilyTransfer, useRespondOthersTransfer } from '@/models/transfer/tanstack-query/useTransfer'
import { useTokenInfoQuery } from '@/shared/api/useTokenInfoQuery'
import { createPaymentId } from '@/models/payment/utils/paymentUtils'
import { requestPayment, type PaymentRequestDTO } from '@/shared/api/payment/payments'

import styles from './TransferPaymentPage.module.css'

type PayMethod = '킷페이'

type TransferState = {
  transferId: number
  senderId: number
  transferStatus: 'ACCEPTED'
  relation: 'FAMILY' | 'OTHERS'
  reservationNumber: string
  title?: string
  datetime?: string
  location?: string
  ticket?: number
  price?: number
  posterFile?: string
}

const TransferPaymentPage: React.FC = () => {
  // 라우팅 및 네비게이터
  const navigate = useNavigate()
  const location = useLocation()
  const navState = (location.state ?? {}) as Partial<TransferState>

  // 관계 분기(FAMILY/OTHERS)
  const relation: 'FAMILY' | 'OTHERS' =
    navState.relation === 'FAMILY' || navState.relation === 'OTHERS' ? navState.relation : 'OTHERS'
  const isFamily = relation === 'FAMILY'

  // 사용자 정보
  const { data: tokenInfo } = useTokenInfoQuery()
  const userId = tokenInfo?.userId

  // 양도 승인 뮤테이션
  const respondFamily = useRespondFamilyTransfer()
  const respondOthers = useRespondOthersTransfer()

  // UI 상태
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | null>(null)
  const [address, setAddress] = useState('')
  const [isAddressFilled, setIsAddressFilled] = useState(false)
  const [isAgreed, setIsAgreed] = useState(false)
  const [openedMethod, setOpenedMethod] = useState<PayMethod | null>(null)

  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [isPwModalOpen, setIsPwModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 결제 식별자 및 금액
  const [paymentId] = useState(() => createPaymentId())
  const amount = (navState.price ?? 0) * (navState.ticket ?? 1)

  // 네비게이션 파라미터 검증
  const transferIdOK = Number.isFinite(Number(navState.transferId))
  const senderIdOK = Number.isFinite(Number(navState.senderId))
  if (!transferIdOK || !senderIdOK) {
    return (
      <div className={styles.page}>
        <header className={styles.header}><h1 className={styles.title}>양도 주문서</h1></header>
        <main className={styles.main}>
          <section className={styles.card}>
            <p>요청 정보가 올바르지 않아요. 목록에서 다시 들어와 주세요.</p>
            <Button onClick={() => navigate(-1)}>뒤로가기</Button>
          </section>
        </main>
      </div>
    )
  }

  // 상품 요약 정보(현재 페이지 표시용)
  const productInfo = {
    title: navState.title,
    datetime: navState.datetime,
    location: navState.location,
    ticket: navState.ticket,
    price: navState.price,
    relation,
    posterFile: navState.posterFile,
  }

  // 결제수단 토글
  const togglePayMethod = (m: PayMethod) => setOpenedMethod((prev) => (prev === m ? null : m))

  // 다음 버튼 활성화 로직
  const needAddress = deliveryMethod === 'PAPER'
  const disabledNext = useMemo(() => {
    if (!deliveryMethod) return true
    const addressOk = needAddress ? isAddressFilled : true
    return isFamily ? !addressOk : !(addressOk && isAgreed && openedMethod !== null)
  }, [deliveryMethod, needAddress, isAddressFilled, isAgreed, openedMethod, isFamily])

  // 양도 승인 DTO
  const buildApproveDTO = () => ({
    transferId: Number(navState.transferId),
    senderId: Number(navState.senderId),
    transferStatus: 'ACCEPTED' as const,
    deliveryMethod: deliveryMethod ?? null,
    address: deliveryMethod === 'PAPER' ? (address || '') : null,
  })

  // 결과 페이지(성공/실패)로 이동(필요 시 사용)
  const routeToResult = (ok: boolean, extra?: Record<string, string | undefined>) => {
    const params = new URLSearchParams({ type: 'transfer', status: ok ? 'success' : 'fail', ...(extra ?? {}) })
    navigate(`/payment/result?${params.toString()}`)
  }

  // “다음” 모달 확인 → 양도 승인 및 결제 요청 생성
  const handleAlertConfirm = async () => {
    setIsAlertOpen(false)
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const dto = buildApproveDTO()

      // 가족 양도: 승인 후 바로 히스토리로 이동
      if (isFamily) {
        await respondFamily.mutateAsync(dto)
        alert('성공적으로 티켓 양도를 받았습니다.')
        navigate('/mypage/ticket/history')
        return
      }

      // 지인 양도: 1) 승인
      await respondOthers.mutateAsync(dto)

      // 2) 결제 요청 생성 (/api/payments/request)
      if (!userId) throw new Error('로그인이 필요합니다.')
      if (!navState.reservationNumber) throw new Error('예약번호가 없습니다.')

      const reqBody: PaymentRequestDTO = {
        paymentId,
        bookingId: navState.reservationNumber, // 예약번호를 bookingId로 전달
        festivalId: null,
        paymentRequestType: 'POINT_PAYMENT_REQUESTED',
        buyerId: userId,
        sellerId: Number(navState.senderId) || null,
        amount,
        currency: 'KRW',
        payMethod: 'POINT_PAYMENT',
      }
      await requestPayment(reqBody, userId)

      // 3) 비밀번호 모달 오픈(모달 내부에서 /api/tekcitpay 호출)
      setIsPwModalOpen(true)
    } catch (e: any) {
      const msg = e?.message || ''
      if (msg.includes('TRANSFER_NOT_MATCH_SENDER')) {
        alert('양도자가 일치하지 않아요. 목록에서 다시 시도해 주세요.')
      } else {
        alert('처리 중 오류가 발생했어요.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // 비밀번호 모달에서 /api/tekcitpay 성공 시 호출되는 콜백
  // 요구사항: alert 확인 후 수수료 결제 페이지(/payment/transfer/transfer-fee)로 이동하며 표시용 스냅샷 state를 함께 전달
  const handlePasswordComplete = async (_password: string) => {
    alert('결제 요청이 정상적으로 처리되었습니다. 수수료 결제 페이지로 이동합니다.')
    navigate('/payment/transfer/transfer-fee', {
      state: {
        transferId: Number(navState.transferId),
        reservationNumber: navState.reservationNumber,
        sellerId: Number(navState.senderId),
        product: {
          title: navState.title ?? '',
          datetime: navState.datetime ?? '',
          ticket: navState.ticket ?? 1,
          price: navState.price ?? 0,
        },
      },
    })
    // 결과 페이지를 별도로 거치지 않으므로 routeToResult는 호출하지 않습니다.
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}><h1 className={styles.title}>양도 주문서</h1></header>

      <div className={styles.layout}>
        <main className={styles.main}>
          <section className={styles.card}><BookingProductInfo info={productInfo} /></section>

          <section className={styles.card}>
            <TicketDeliverySelectSection
              value={deliveryMethod}
              onChange={(v) => {
                setDeliveryMethod(v)
                if (v !== 'PAPER') { setIsAddressFilled(false); setAddress('') }
              }}
            />
          </section>

          {needAddress && (
            <section className={styles.card}>
              <AddressForm onValidChange={setIsAddressFilled} onAddressChange={setAddress} />
            </section>
          )}

          {!isFamily && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>결제 수단</h2>
              <div className={styles.paymentBox}>
                <div className={`${styles.methodCard} ${openedMethod === '킷페이' ? styles.active : ''}`}>
                  <button
                    className={styles.methodHeader}
                    onClick={() => togglePayMethod('킷페이')}
                    aria-expanded={openedMethod === '킷페이'}
                  >
                    <span className={`${styles.radio} ${openedMethod === '킷페이' ? styles.radioOn : ''}`} />
                    <span className={styles.methodText}>킷페이 (포인트 결제)</span>
                  </button>
                  {openedMethod === '킷페이' && (
                    <div className={styles.methodBody}>
                      <WalletPayment isOpen onToggle={() => togglePayMethod('킷페이')} dueAmount={amount} />
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </main>

        <aside className={styles.sidebar}>
          <div className={styles.sticky}>
            {!isFamily && (
              <section className={`${styles.card} ${styles.summaryCard}`} aria-label="결제 요약">
                <h2 className={styles.cardTitle}>결제 요약</h2>

                <div className={styles.priceRow}>
                  <span>수령 방법</span>
                  <span className={styles.priceValue}>
                    {deliveryMethod ? (deliveryMethod === 'QR' ? 'QR 전자티켓' : '지류(배송)') : '-'}
                  </span>
                </div>

                <div className={styles.priceRow}>
                  <span>티켓 가격</span>
                  <span className={styles.priceValue}>{amount.toLocaleString()}원</span>
                </div>

                <div className={styles.divider} />

                <div className={styles.priceTotal} aria-live="polite">
                  <strong>총 결제 금액</strong>
                  <strong className={styles.priceStrong}>{amount.toLocaleString()}원</strong>
                </div>

                <label className={styles.agree}>
                  <input
                    type="checkbox"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    aria-label="양도 서비스 약관 동의"
                  />
                  <span>(필수) 양도 서비스 이용약관 및 개인정보 수집·이용에 동의합니다.</span>
                </label>

                <Button
                  disabled={disabledNext || isSubmitting || !userId}
                  className={styles.nextBtn}
                  aria-disabled={disabledNext || isSubmitting || !userId}
                  aria-label="다음 단계로 이동"
                  onClick={() => setIsAlertOpen(true)}
                >
                  {isSubmitting ? '처리 중…' : '다음'}
                </Button>
              </section>
            )}

            {isFamily && (
              <section className={`${styles.card} ${styles.summaryCard}`} aria-label="무료 양도 안내">
                <h2 className={styles.cardTitle}>가족 양도</h2>
                <p className={styles.freeDesc}>
                  가족 간 양도는 <strong>무료</strong>로 진행돼요.<br />결제 과정 없이 다음 단계로 넘어갑니다.
                </p>
                <div className={styles.priceRow}>
                  <span>수령 방법</span>
                  <span className={styles.priceValue}>
                    {deliveryMethod ? (deliveryMethod === 'QR' ? 'QR 전자티켓' : '지류(배송)') : '-'}
                  </span>
                </div>
                <Button
                  disabled={disabledNext || isSubmitting}
                  className={styles.nextBtn}
                  aria-disabled={disabledNext || isSubmitting}
                  aria-label="양도 완료로 이동"
                  onClick={() => setIsAlertOpen(true)}
                >
                  {isSubmitting ? '처리 중…' : '다음'}
                </Button>
              </section>
            )}
          </div>
        </aside>
      </div>

      {isAlertOpen && (
        <AlertModal title="안내" onCancel={() => setIsAlertOpen(false)} onConfirm={handleAlertConfirm}>
          {isFamily ? '가족 간 양도는 결제 없이 진행됩니다. 계속하시겠습니까?' : '승인 후 결제를 진행합니다. 계속하시겠습니까?'}
        </AlertModal>
      )}

      {!isFamily && isPwModalOpen && userId && (
        <PasswordInputModal
          amount={amount}
          paymentId={paymentId}
          userId={userId}
          onClose={() => setIsPwModalOpen(false)}
          onComplete={handlePasswordComplete} // 성공 시 alert 후 수수료 결제 페이지로 이동(+스냅샷 전달)
        />
      )}
    </div>
  )
}

export default TransferPaymentPage
