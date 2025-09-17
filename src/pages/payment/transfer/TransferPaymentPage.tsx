// src/pages/payment/TransferPaymentPage.tsx
import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

import BookingProductInfo from '@/components/payment/BookingProductInfo'
import AddressForm from '@/components/payment/address/AddressForm'
import Button from '@/components/common/button/Button'
import AlertModal from '@/components/common/modal/AlertModal'
import PasswordInputModal from '@/components/payment/modal/TransferPasswordInputModal'
import WalletPayment from '@/components/payment/pay/TekcitPay'
import TicketDeliverySelectSection, {
  type DeliveryMethod,
  type DeliveryAvailabilityCode,
} from '@/components/booking/TicketDeliverySelectSection'

import { useRespondFamilyTransfer, useRespondOthersTransfer } from '@/models/transfer/tanstack-query/useTransfer'
import { useTokenInfoQuery } from '@/shared/api/useTokenInfoQuery'
import { requestTransferPayment, type RequestTransferPaymentDTO, getPaymentIdByBookingId } from '@/shared/api/payment/payments'

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

  ticketPick?: 1 | 2
  allowedDelivery?: ('QR' | 'PAPER')[]
}

const BookingIdSchema = z.string().min(1)

const TransferPaymentPage: React.FC = () => {
  const stompClientRef = useRef<Client | null>(null)

  const navigate = useNavigate()
  const location = useLocation()
  const navState = (location.state ?? {}) as Partial<TransferState>

  const relation: 'FAMILY' | 'OTHERS' =
    navState.relation === 'FAMILY' || navState.relation === 'OTHERS' ? navState.relation : 'OTHERS'
  const isFamily = relation === 'FAMILY'

  // 1=둘 다, 2=QR만
  const ticketPick: DeliveryAvailabilityCode = (navState.ticketPick as DeliveryAvailabilityCode) ?? 1
  const paperAllowed = ticketPick === 1

  const { data: tokenInfo } = useTokenInfoQuery()
  const userId = tokenInfo?.userId

  const respondFamily = useRespondFamilyTransfer()
  const respondOthers = useRespondOthersTransfer()

  // 기존 결제정보 조회(지인만)
  const {
    data: basePayment,
    isLoading: isBasePayLoading,
    isError: isBasePayError,
    error: basePayError,
  } = useQuery({
    queryKey: ['basePayment', navState.reservationNumber, userId],
    queryFn: async () => {
      if (!userId) throw new Error('로그인이 필요합니다.')
      const bookingId = BookingIdSchema.parse(navState.reservationNumber!)
      const info = await getPaymentIdByBookingId(bookingId, userId)
      if (!info?.paymentId) throw new Error('기존 결제 정보를 찾을 수 없습니다.')
      return info
    },
    enabled: !!userId && !!navState.reservationNumber && !isFamily,
    staleTime: 60_000,
  })

  // WebSocket
  useEffect(() => {
    if (!navState.transferId) return

    if (stompClientRef.current?.connected) {
      stompClientRef.current.deactivate()
      stompClientRef.current = null
    }

    const client = new Client({
      webSocketFactory: () => new (SockJS as any)('http://localhost:10000/ws'),
      connectHeaders: {},
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    })

    client.onConnect = () => {
      stompClientRef.current = client
      client.subscribe('/user/queue/transfer-status', (message) => {
        const data = JSON.parse(message.body)
        if (data.reservationNumber === navState.reservationNumber) {
          if (data.status === 'COMPLETED') navigate('/payment/result?type=transfer&status=success')
          else if (data.status === 'FAILED' || data.status === 'CANCELED')
            navigate('/payment/result?type=transfer&status=fail')
        }
      })
    }

    client.activate()
    return () => {
      if (stompClientRef.current?.connected) {
        stompClientRef.current.deactivate()
        stompClientRef.current = null
      }
    }
  }, [navState.transferId, navState.reservationNumber, userId, navigate])

  // UI 상태
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | null>(null)
  const [address, setAddress] = useState('')
  const [isAddressFilled, setIsAddressFilled] = useState(false)
  const [isAgreed, setIsAgreed] = useState(false)
  const [openedMethod, setOpenedMethod] = useState<PayMethod | null>(null)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [isPwModalOpen, setIsPwModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // QR-only면 자동 QR
  useEffect(() => {
    if (!paperAllowed) setDeliveryMethod('QR')
  }, [paperAllowed])

  // 금액(표시용)
  const amount = (navState.price ?? 0) * (navState.ticket ?? 1)
  const commision = Math.floor(amount * 0.1)
  const totalAmount = amount + commision

  // 가드
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

  const basePaymentId = basePayment?.paymentId
  const baseAmount = basePayment?.amount ?? 0

  const productInfo = {
    title: navState.title,
    datetime: navState.datetime,
    location: navState.location,
    ticket: navState.ticket,
    price: navState.price,
    relation,
    posterFile: navState.posterFile,
  }

  const togglePayMethod = (m: PayMethod) => setOpenedMethod((prev) => (prev === m ? null : m))

  // 라디오 변경
  const handleMethodChange = useCallback((m: DeliveryMethod | null) => {
    if (m === 'PAPER' && !paperAllowed) return
    setDeliveryMethod(m)
    if (m !== 'PAPER') { setIsAddressFilled(false); setAddress('') }
  }, [paperAllowed])

  const needAddress = deliveryMethod === 'PAPER'
  const disabledNext = useMemo(() => {
    if (deliveryMethod === 'PAPER' && !paperAllowed) return true
    if (!deliveryMethod) return true
    const addressOk = needAddress ? isAddressFilled : true
    const othersOk =
      addressOk && isAgreed && openedMethod !== null &&
      !isBasePayLoading && !!basePaymentId && !isBasePayError
    return isFamily ? !addressOk : !othersOk
  }, [
    deliveryMethod, needAddress, isAddressFilled, isAgreed,
    openedMethod, isFamily, isBasePayLoading, isBasePayError, basePaymentId, paperAllowed,
  ])

  const buildApproveDTO = () => ({
    transferId: Number(navState.transferId),
    senderId: Number(navState.senderId),
    transferStatus: 'ACCEPTED' as const,
    deliveryMethod: deliveryMethod ?? null,
    address: deliveryMethod === 'PAPER' ? (address || '') : null,
  })

  const handleAlertConfirm = async () => {
    setIsAlertOpen(false)
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      if (isFamily) {
        await respondFamily.mutateAsync(buildApproveDTO())
        alert('성공적으로 티켓 양도를 받았습니다.')
        navigate('/mypage/ticket/history')
        return
      }
      if (!userId) throw new Error('로그인이 필요합니다.')
      if (isBasePayLoading) throw new Error('결제 정보를 불러오는 중입니다.')
      if (!basePaymentId) throw new Error((basePayError as any)?.message || '기존 결제 정보를 찾을 수 없습니다.')

      await respondOthers.mutateAsync(buildApproveDTO())
      setIsPwModalOpen(true)
    } catch (e: any) {
      alert(e?.response?.data?.errorMessage || e?.message || '승인 처리에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordComplete = async (password: string) => {
    try {
      if (!userId || !basePaymentId) throw new Error('필수 정보가 없습니다.')
      const RATE = Number(import.meta.env.VITE_TRANSFER_FEE_RATE ?? 0.1)
      const commission = Math.max(1, Math.floor(baseAmount * RATE))
      const transferReqBody: RequestTransferPaymentDTO = {
        sellerId: Number(navState.senderId) || 0,
        paymentId: basePaymentId,
        bookingId: navState.reservationNumber!,
        totalAmount: baseAmount,
        commission,
      }
      await requestTransferPayment(transferReqBody, userId)
      setTimeout(() => {
        navigate('/payment/result?type=transfer&status=success')
      }, 2000)
    } catch (e: any) {
      alert(e?.response?.data?.errorMessage || e?.message || '양도 처리에 실패했습니다.')
      navigate('/payment/result?type=transfer&status=fail')
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}><h1 className={styles.title}>양도 주문서</h1></header>

      <div className={styles.layout}>
        <main className={styles.main}>
          <section className={styles.card}><BookingProductInfo info={productInfo} /></section>

          <section className={styles.delieryCard}>
            <TicketDeliverySelectSection
              value={deliveryMethod}
              onChange={handleMethodChange}
              availabilityCode={ticketPick}
              hideUnavailable={false}
            />
          </section>

          {deliveryMethod === 'PAPER' && (
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
                    onClick={() => setOpenedMethod((p) => (p === '킷페이' ? null : '킷페이'))}
                    aria-expanded={openedMethod === '킷페이'}
                    disabled={isBasePayLoading || isBasePayError}
                    title={
                      isBasePayLoading
                        ? '결제 정보를 불러오는 중입니다.'
                        : isBasePayError
                          ? (basePayError as any)?.message ?? '결제 정보를 찾을 수 없습니다.'
                          : undefined
                    }
                  >
                    <span className={`${styles.radio} ${openedMethod === '킷페이' ? styles.radioOn : ''}`} />
                    <span className={styles.methodText}>
                      킷페이 (포인트 결제)
                      {isBasePayLoading ? ' - 결제정보 조회중...' : ''}
                    </span>
                  </button>
                  {openedMethod === '킷페이' && (
                    <div className={styles.methodBody}>
                      <WalletPayment isOpen onToggle={() => setOpenedMethod(null)} dueAmount={amount} />
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

                <div className={styles.priceRow}>
                  <span>수수료 (10%)</span>
                  <span className={styles.priceValue}> {commision.toLocaleString()}원 </span>
                </div>

                <div className={styles.divider} />

                <div className={styles.priceTotal} aria-live="polite">
                  <strong>총 결제 금액</strong>
                  <strong className={styles.priceStrong}>{totalAmount.toLocaleString()}원</strong>
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

      {!isFamily && isPwModalOpen && userId && basePaymentId && (
        <PasswordInputModal
          amount={baseAmount}
          paymentId={basePaymentId}
          userId={userId}
          onClose={() => setIsPwModalOpen(false)}
          onComplete={handlePasswordComplete}
        />
      )}
    </div>
  )
}

export default TransferPaymentPage
