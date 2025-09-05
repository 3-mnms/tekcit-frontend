// src/pages/payment/TransferPaymentPage.tsx
// 목적: 양도 결제 페이지. 가족(FAMILY)은 무료 처리, 지인(OTHERS)은 킷페이 결제 진행 멍
// 최종 흐름: 다음 클릭 → (가족) 승인 후 히스토리 이동 멍
//          : 다음 클릭 → (지인) 비번 모달 → requestTekcitPay(기존 paymentId 사용) → respondOthers 승인 → requestTransferPayment(같은 paymentId) → 수수료 결제 페이지로 이동(+스냅샷) 멍

import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query' // 결제ID 조회용 쿼리 사용 멍

import BookingProductInfo from '@/components/payment/BookingProductInfo'
import AddressForm from '@/components/payment/address/AddressForm'
import Button from '@/components/common/button/Button'
import AlertModal from '@/components/common/modal/AlertModal'
import PasswordInputModal from '@/components/payment/modal/PasswordInputModal'
import WalletPayment from '@/components/payment/pay/TekcitPay'
import TicketDeliverySelectSection, { type DeliveryMethod } from '@/components/booking/TicketDeliverySelectSection'

import { useRespondFamilyTransfer, useRespondOthersTransfer } from '@/models/transfer/tanstack-query/useTransfer'
import { useTokenInfoQuery } from '@/shared/api/useTokenInfoQuery'

// tekcitpay/transfer 호출 + 기존 paymentId 조회 유틸 멍
import {
  requestTekcitPay,
  requestTransferPayment,
  type requestTransferPaymentDTO,
  getPaymentIdByBookingId,      // 예약번호로 기존 paymentId 조회(세션스토리지) 멍
} from '@/shared/api/payment/payments'

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
  // 라우팅 및 네비게이터 멍
  const navigate = useNavigate()
  const location = useLocation()
  const navState = (location.state ?? {}) as Partial<TransferState>

  // 관계 분기(FAMILY/OTHERS) 멍
  const relation: 'FAMILY' | 'OTHERS' =
    navState.relation === 'FAMILY' || navState.relation === 'OTHERS' ? navState.relation : 'OTHERS'
    navState.relation === 'FAMILY' || navState.relation === 'OTHERS' ? navState.relation : 'OTHERS'
  const isFamily = relation === 'FAMILY'

  // 사용자 정보 멍
  const { data: tokenInfo } = useTokenInfoQuery()
  const userId = tokenInfo?.userId

  // 양도 승인 뮤테이션 멍
  const respondFamily = useRespondFamilyTransfer()
  const respondOthers = useRespondOthersTransfer()

  // UI 상태 멍
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | null>(null)
  const [address, setAddress] = useState('')
  const [isAddressFilled, setIsAddressFilled] = useState(false)
  const [isAgreed, setIsAgreed] = useState(false)
  const [openedMethod, setOpenedMethod] = useState<PayMethod | null>(null)
  const [isAgreed, setIsAgreed] = useState(false)
  const [openedMethod, setOpenedMethod] = useState<PayMethod | null>(null)

  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [isPwModalOpen, setIsPwModalOpen] = useState(false)
  const [isPwModalOpen, setIsPwModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 결제 금액(티켓 단가 × 수량) 멍
  const amount = (navState.price ?? 0) * (navState.ticket ?? 1)

  // 네비게이션 파라미터 검증(필수 id만 체크) 멍
  const transferIdOK = Number.isFinite(Number(navState.transferId))
  const senderIdOK = Number.isFinite(Number(navState.senderId))
  if (!transferIdOK || !senderIdOK) {
    return (
      <div className={styles.page}>
        <header className={styles.header}><h1 className={styles.title}>양도 주문서</h1></header>
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

  // 기존 결제의 paymentId 조회(예약번호 기준, 세션스토리지) 멍
  // - 세션스토리지 동기 조회이지만, 화면 상태 일관성을 위해 useQuery로 래핑 멍
  const {
    data: paymentId,
    isLoading: isPaymentIdLoading,
    isError: isPaymentIdError,
    error: paymentIdError,
  } = useQuery({
    queryKey: ['paymentIdByBooking', navState.reservationNumber],
    // 동기 결과를 Promise.resolve로 감싸 비동기처럼 사용 멍
    queryFn: async () => {
      if (!navState.reservationNumber) throw new Error('예약번호가 없습니다.')
      const pid = getPaymentIdByBookingId(navState.reservationNumber)
      if (!pid) throw new Error('결제 정보를 찾을 수 없습니다. 예매 결제 단계에서 다시 시도해 주세요.')
      return pid
    },
    enabled: !!navState.reservationNumber && !isFamily, // 가족은 결제 단계가 없으니 조회 불필요 멍
    staleTime: 60_000,
  })

  // 상품 요약 정보(현재 페이지 표시용) 멍
  const productInfo = {
    title: navState.title,
    datetime: navState.datetime,
    location: navState.location,
    ticket: navState.ticket,
    price: navState.price,
    relation,
    posterFile: navState.posterFile,
  }

  // 결제수단 토글 멍
  const togglePayMethod = (m: PayMethod) => setOpenedMethod((prev) => (prev === m ? null : m))

  // 다음 버튼 활성화 로직 멍
  const needAddress = deliveryMethod === 'PAPER'
  const disabledNext = useMemo(() => {
    if (!deliveryMethod) return true
    if (!deliveryMethod) return true
    const addressOk = needAddress ? isAddressFilled : true
    // 지인 결제는 동의 + 결제수단 + paymentId 로딩 완료까지 확인 멍
    const othersOk =
      addressOk &&
      isAgreed &&
      openedMethod !== null &&
      (!isPaymentIdLoading) &&
      !!paymentId &&
      !isPaymentIdError
    return isFamily ? !addressOk : !othersOk
  }, [
    deliveryMethod,
    needAddress,
    isAddressFilled,
    isAgreed,
    openedMethod,
    isFamily,
    isPaymentIdLoading,
    isPaymentIdError,
    paymentId,
  ])

  // 양도 승인 DTO(가족/지인 공통) 멍
  const buildApproveDTO = () => ({
    transferId: Number(navState.transferId),
    senderId: Number(navState.senderId),
    transferStatus: 'ACCEPTED' as const,
    deliveryMethod: deliveryMethod ?? null,
    transferStatus: 'ACCEPTED' as const,
    deliveryMethod: deliveryMethod ?? null,
    address: deliveryMethod === 'PAPER' ? (address || '') : null,
  })

  // “다음” 모달 확인 멍
  // 가족: 기존과 동일하게 승인 후 히스토리로 이동 멍
  // 지인: 여기서는 결제/transfer 요청 없이 비밀번호 모달만 연다(tekcitpay 먼저 처리) 멍
  const handleAlertConfirm = async () => {
    setIsAlertOpen(false)
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const dto = buildApproveDTO()

      if (isFamily) {
        await respondFamily.mutateAsync(dto)
        alert('성공적으로 티켓 양도를 받았습니다.')
        navigate('/mypage/ticket/history')
        navigate('/mypage/ticket/history')
        return
      }

      if (!userId) throw new Error('로그인이 필요합니다.')
      if (!navState.reservationNumber) throw new Error('예약번호가 없습니다.')
      if (isPaymentIdLoading) throw new Error('결제 정보를 불러오는 중입니다.')
      if (!paymentId) throw new Error((paymentIdError as any)?.message || '결제 정보를 찾을 수 없습니다.')

      // 지인: 승인(respondOthers)은 결제 성공 후로 미룸 멍
      setIsPwModalOpen(true)
    } catch (e: any) {
      const msg = e?.message || ''
      if (msg.includes('TRANSFER_NOT_MATCH_SENDER')) {
        alert('양도자가 일치하지 않아요. 목록에서 다시 시도해 주세요.')
      } else {
        alert(msg || '처리 중 오류가 발생했어요.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // 비밀번호 모달 완료 콜백 멍
  // 1) requestTekcitPay(amount, paymentId, password) 멍
  // 2) respondOthers 승인 멍
  // 3) 같은 paymentId로 requestTransferPayment 멍
  // 4) 수수료 결제 페이지로 이동(+ 스냅샷) 멍
  const handlePasswordComplete = async (_password: string) => {
    try {
      if (!userId) throw new Error('로그인이 필요합니다.')
      if (!navState.reservationNumber) throw new Error('예약번호가 없습니다.')
      if (!paymentId) throw new Error('결제 정보를 찾을 수 없습니다.')

      // 1) tekcitpay(지갑 결제) 호출: 기존 paymentId 사용 멍
      await requestTekcitPay(
        {
          amount,             // 주문 금액 멍
          paymentId,          // 기존 결제의 paymentId 멍
          password: _password // 입력 받은 비밀번호 멍
        },
        userId
      )

      // 2) 양도 승인(지인): 결제 성공 이후 승인 처리 멍
      const approveDTO = buildApproveDTO()
      await respondOthers.mutateAsync(approveDTO)

      // 3) 같은 paymentId로 transfer 결제 요청 생성 멍
      const transferReqBody: requestTransferPaymentDTO = {
        sellerId: Number(navState.senderId) || 0,
        paymentId, // tekcitpay에서 사용한 동일한 paymentId 멍
        bookingId: navState.reservationNumber,
        totalAmount: amount,
        commission: 0, // 수수료는 다음 단계에서 결제 멍
      }
      await requestTransferPayment(transferReqBody, userId)

      // 4) 안내 후 수수료 결제 페이지로 이동(+ 스냅샷 state) 멍
      alert('결제가 완료되었습니다. 수수료 결제 페이지로 이동합니다.')
      navigate('/payment/transfer/transfer-fee', {
        state: {
          transferId: Number(navState.transferId),
          reservationNumber: navState.reservationNumber,
          sellerId: Number(navState.senderId),
          paymentId, // 다음 단계에서도 동일 paymentId 사용 가능 멍
          product: {
            title: navState.title ?? '',
            datetime: navState.datetime ?? '',
            ticket: navState.ticket ?? 1,
            price: navState.price ?? 0,
          },
        },
      })
    } catch (e: any) {
      console.error('tekcitpay/transfer 처리 실패:', e)
      const msg = e?.response?.data?.errorMessage || e?.message || '결제 또는 양도 처리에 실패했습니다.'
      alert(msg)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}><h1 className={styles.title}>양도 주문서</h1></header>
      <header className={styles.header}><h1 className={styles.title}>양도 주문서</h1></header>

      <div className={styles.layout}>
        <main className={styles.main}>
          <section className={styles.card}><BookingProductInfo info={productInfo} /></section>
          <section className={styles.card}><BookingProductInfo info={productInfo} /></section>

          <section className={styles.card}>
            <TicketDeliverySelectSection
              value={deliveryMethod}
              onChange={(v) => {
                setDeliveryMethod(v)
                if (v !== 'PAPER') { setIsAddressFilled(false); setAddress('') }
                if (v !== 'PAPER') { setIsAddressFilled(false); setAddress('') }
              }}
            />
          </section>

          {needAddress && (
            <section className={styles.card}>
              <AddressForm onValidChange={setIsAddressFilled} onAddressChange={setAddress} />
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
                    disabled={isPaymentIdLoading || isPaymentIdError}
                    title={
                      isPaymentIdLoading
                        ? '결제 정보를 불러오는 중입니다.'
                        : isPaymentIdError
                        ? (paymentIdError as any)?.message ?? '결제 정보를 찾을 수 없습니다.'
                        : undefined
                    }
                  >
                    <span className={`${styles.radio} ${openedMethod === '킷페이' ? styles.radioOn : ''}`} />
                    <span className={styles.methodText}>
                      킷페이 (포인트 결제)
                      {isPaymentIdLoading ? ' - 결제정보 조회중...' : ''}
                    </span>
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
                  <input type="checkbox" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} aria-label="양도 서비스 약관 동의" />
                  <span>(필수) 양도 서비스 이용약관 및 개인정보 수집·이용에 동의합니다.</span>
                </label>

                <Button
                  disabled={disabledNext || isSubmitting || !userId}
                  disabled={disabledNext || isSubmitting || !userId}
                  className={styles.nextBtn}
                  aria-disabled={disabledNext || isSubmitting || !userId}
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
        <AlertModal title="안내" onCancel={() => setIsAlertOpen(false)} onConfirm={handleAlertConfirm}>
          {isFamily ? '가족 간 양도는 결제 없이 진행됩니다. 계속하시겠습니까?' : '승인 후 결제를 진행합니다. 계속하시겠습니까?'}
        </AlertModal>
      )}

      {!isFamily && isPwModalOpen && userId && paymentId && (
        <PasswordInputModal
          amount={amount}
          paymentId={paymentId}   // 기존 결제의 paymentId를 그대로 전달(표시/검증용) 멍
          userId={userId}
          onClose={() => setIsPwModalOpen(false)}
          onComplete={handlePasswordComplete} // tekcitpay → 승인 → transfer 순서 멍
        />
      )}
    </div>
  )
}

export default TransferPaymentPage
