// src/pages/payment/TransferPaymentPage.tsx
import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import BookingProductInfo from '@/components/payment/BookingProductInfo'
import AddressForm from '@/components/payment/address/AddressForm'
import Button from '@/components/common/button/Button'
import AlertModal from '@/components/common/modal/AlertModal'
import PasswordInputModal from '@/components/payment/modal/PasswordInputModal'
import WalletPayment from '@/components/payment/pay/TekcitPay'

import TicketDeliverySelectSection, {
  type DeliveryMethod,
} from '@/components/booking/TicketDeliverySelectSection'

import {
  useRespondFamilyTransfer,
  useRespondOthersTransfer,
} from '@/models/transfer/tanstack-query/useTransfer'

import styles from './TransferPaymentPage.module.css'

type PayMethod = '킷페이' | '토스'

type TransferState = {
  transferId: number
  senderId: number
  transferStatus: 'ACCEPTED'
  relation: 'FAMILY' | 'OTHERS'
  reservationNumber: string
  // 표시용
  title?: string
  datetime?: string
  location?: string
  ticket?: number
  price?: number
  posterFile?: string
}

const TransferPaymentPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const navState = (location.state ?? {}) as Partial<TransferState>

  // relation 보정(안전장치)
  const relation: 'FAMILY' | 'OTHERS' =
    navState.relation === 'FAMILY' || navState.relation === 'OTHERS'
      ? navState.relation
      : 'OTHERS'
  const isFamily = relation === 'FAMILY'

  // ── 서버 호출 훅 ──────────────────────────────────────────────────────
  const respondFamily = useRespondFamilyTransfer()
  const respondOthers = useRespondOthersTransfer()

  // ── 상태 ──────────────────────────────────────────────────────────────
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | null>(null)
  const needAddress = deliveryMethod === 'PAPER'

  const [address, setAddress] = useState('')
  const [isAddressFilled, setIsAddressFilled] = useState(false)
  const [isAgreed, setIsAgreed] = useState(false) // 지인 결제만 사용
  const [openedMethod, setOpenedMethod] = useState<PayMethod | null>(null) // 지인 결제만 사용

  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [isPwModalOpen, setIsPwModalOpen] = useState(false) // 지인 결제만 사용
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 필수 파라미터 가드
  const transferIdOK = Number.isFinite(Number(navState.transferId))
  const senderIdOK = Number.isFinite(Number(navState.senderId))
  if (!transferIdOK || !senderIdOK) {
    console.error('[TransferPaymentPage] invalid ids:', navState)
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>양도 주문서</h1>
        </header>
        <main className={styles.main}>
          <section className={styles.card}>
            <p>요청 정보가 올바르지 않아요. 목록에서 다시 들어와 주세요.</p>
            <Button onClick={() => navigate(-1)}>뒤로가기</Button>
          </section>
        </main>
      </div>
    )
  }

  // 표시용 금액(요약/결제)
  const amount = (navState.price ?? 0) * (navState.ticket ?? 1)

  // BookingProductInfo로 내려줄 info 패킷
  const productInfo = {
    title: navState.title,
    datetime: navState.datetime,
    location: navState.location,
    ticket: navState.ticket,
    price: navState.price,
    relation,
    posterFile: navState.posterFile,
  }

  // ── 유틸 ──────────────────────────────────────────────────────────────
  const routeToResult = (ok: boolean, extra?: Record<string, string | undefined>) => {
    const params = new URLSearchParams({
      type: 'transfer',
      status: ok ? 'success' : 'fail',
      ...(extra ?? {}),
    })
    navigate(`/payment/result?${params.toString()}`)
  }

  const togglePayMethod = (m: PayMethod) => {
    setOpenedMethod(prev => (prev === m ? null : m))
  }

  // ── 버튼 활성화 조건 ─────────────────────────────────────────────────
  const disabledNext = useMemo(() => {
    if (!deliveryMethod) return true // 수령방법 필수
    const addressOk = needAddress ? isAddressFilled : true

    if (isFamily) return !addressOk // 가족: 주소만(필요 시)

    // 지인: 주소(필요 시) + 약관 + 결제수단
    return !(addressOk && isAgreed && openedMethod !== null)
  }, [deliveryMethod, needAddress, isAddressFilled, isAgreed, openedMethod, isFamily])

  // ── 승인 DTO 생성 (프론트표기 → API 내부에서 서버표기로 변환) ──────────
  const buildApproveDTO = () => ({
    transferId: Number(navState.transferId),
    senderId: Number(navState.senderId),
    transferStatus: 'ACCEPTED' as const,       // 프론트 표기(ACCEPTED) → API에서 'APPROVED'로 변환
    deliveryMethod: deliveryMethod ?? null,    // QR/PAPER/null
    address: deliveryMethod === 'PAPER' ? (address || '') : null,
  })

  // ── 모달 핸들러 ──────────────────────────────────────────────────────
  const handleAlertConfirm = async () => {
    setIsAlertOpen(false)
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const dto = buildApproveDTO()
      console.log('[approve] relation:', relation, 'dto:', dto)

      if (isFamily) {
        await respondFamily.mutateAsync(dto)
        alert('성공적으로 티켓 양도를 받았습니다.')
        navigate('/mypage/ticket/history') // ← 예매내역 경로에 맞춰 필요 시 '/mypage/ticket/reservations' 등으로 변경
        return
      } else {
        await respondOthers.mutateAsync(dto)
        setIsPwModalOpen(true)
      }
    } catch (e: any) {
      const msg = e?.message || ''
      if (msg.includes('TRANSFER_NOT_MATCH_SENDER')) {
        alert('양도자가 일치하지 않아요. 목록에서 다시 시도해 주세요.')
      } else {
        alert('승인 처리 중 오류가 발생했어요.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleAlertCancel = () => setIsAlertOpen(false)

  const handlePasswordComplete = async (password: string) => {
    setIsPwModalOpen(false)
    // TODO: 실제 결제 연동
    const ok = Math.random() < 0.9
    routeToResult(ok, { relation: 'OTHERS' })
  }

  // ── 렌더 ──────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>양도 주문서</h1>
      </header>

      <div className={styles.layout}>
        <main className={styles.main}>
          {/* 상품 정보 */}
          <section className={styles.card}>
            <BookingProductInfo info={productInfo} />
          </section>

          {/* 1) 수령 방법 선택 (주소보다 먼저) */}
          <section className={styles.card}>
            <TicketDeliverySelectSection
              value={deliveryMethod}
              onChange={(v) => {
                setDeliveryMethod(v)
                if (v !== 'PAPER') {
                  setIsAddressFilled(false)
                  setAddress('')
                }
              }}
            />
          </section>

          {/* 2) 지류(PAPER)일 때만 주소 폼 */}
          {needAddress && (
            <section className={styles.card}>
              <AddressForm
                onValidChange={setIsAddressFilled}
                onAddressChange={setAddress}
              />
            </section>
          )}

          {/* 3) 결제 수단 (가족은 숨김) */}
          {!isFamily && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>결제 수단</h2>
              <div className={styles.paymentBox}>
                {/* 킷페이 */}
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

        {/* 오른쪽 요약 */}
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
                  disabled={disabledNext || isSubmitting}
                  className={styles.nextBtn}
                  aria-disabled={disabledNext || isSubmitting}
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
                  가족 간 양도는 <strong>무료</strong>로 진행돼요.<br />
                  결제 과정 없이 다음 단계로 넘어갑니다.
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

      {/* 모달 */}
      {isAlertOpen && (
        <AlertModal
          title="안내"
          onCancel={() => setIsAlertOpen(false)}
          onConfirm={handleAlertConfirm}
        >
          {isFamily
            ? '가족 간 양도는 결제 없이 진행됩니다. 계속하시겠습니까?'
            : '승인 후 결제를 진행합니다. 계속하시겠습니까?'}
        </AlertModal>
      )}

      {!isFamily && isPwModalOpen && (
        <PasswordInputModal
          onClose={() => setIsPwModalOpen(false)}
          onComplete={handlePasswordComplete}
        />
      )}
    </div>
  )
}

export default TransferPaymentPage
