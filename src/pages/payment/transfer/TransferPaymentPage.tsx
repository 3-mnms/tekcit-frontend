// src/pages/payment/TransferPaymentPage.tsx
import { useMemo, useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import SockJS from 'sockjs-client'
// import { Stomp } from '@stomp/stompjs'
import { Client } from '@stomp/stompjs'

import BookingProductInfo from '@/components/payment/BookingProductInfo'
import AddressForm from '@/components/payment/address/AddressForm'
import Button from '@/components/common/button/Button'
import AlertModal from '@/components/common/modal/AlertModal'
import PasswordInputModal from '@/components/payment/modal/TransferPasswordInputModal'
import WalletPayment from '@/components/payment/pay/TekcitPay'
import TicketDeliverySelectSection, { type DeliveryMethod } from '@/components/booking/TicketDeliverySelectSection'

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
}

// 예약번호 유효성 체크 스키마
const BookingIdSchema = z.string().min(1)

const TransferPaymentPage: React.FC = () => {
  // const stompClientRef = useRef<any>(null)
  const stompClientRef = useRef<Client | null>(null)

  // 라우팅/상태
  const navigate = useNavigate()
  const location = useLocation()
  const navState = (location.state ?? {}) as Partial<TransferState>

  // 관계 분기
  const relation: 'FAMILY' | 'OTHERS' =
    navState.relation === 'FAMILY' || navState.relation === 'OTHERS' ? navState.relation : 'OTHERS'
  const isFamily = relation === 'FAMILY'

  // 유저 정보
  const { data: tokenInfo } = useTokenInfoQuery()
  const userId = tokenInfo?.userId

  // 승인 뮤테이션
  const respondFamily = useRespondFamilyTransfer()
  const respondOthers = useRespondOthersTransfer()

  // ✅ 서버에서 bookingId → db에 저장된 기존 예매 결제 정보(paymentId, amount) 조회
  const {
    data: basePayment,                 // { paymentId, amount, ... }
    isLoading: isBasePayLoading,
    isError: isBasePayError,
    error: basePayError,
  } = useQuery({
    queryKey: ['basePayment', navState.reservationNumber, userId],
    queryFn: async () => {
      if (!userId) throw new Error('로그인이 필요합니다.')
      const bookingId = BookingIdSchema.parse(navState.reservationNumber!)
      const info = await getPaymentIdByBookingId(bookingId, userId) // PaymentInfoByBooking 반환
      if (!info?.paymentId) throw new Error('기존 결제 정보를 찾을 수 없습니다.')
      return info
    },
    enabled: !!userId && !!navState.reservationNumber && !isFamily,
    staleTime: 60_000,
  })

  // 웹소켓 연결
  useEffect(() => {
    console.log('[Transfer WebSocket] 초기화 시작, transferId:', navState.transferId)

    if (!navState.transferId) {
      console.log('[Transfer WebSocket] transferId 없음, 연결하지 않음')
      return
    }

    // 기존 연결이 있으면 먼저 정리
    if (stompClientRef.current?.connected) {
      console.log('[Transfer WebSocket] 기존 연결 해제 중...')
      stompClientRef.current.deactivate()
      stompClientRef.current = null
    }

    const connectWebSocket = () => {
      console.log('[Transfer WebSocket] 새 연결 시작...')
      console.log('[Transfer WebSocket] 연결 URL: http://localhost:10000/ws')

      // 최신 @stomp/stompjs Client 방식 사용
      const client = new Client({
        webSocketFactory: () => new (SockJS as any)('http://localhost:10000/ws'),
        connectHeaders: {},
        debug: (str) => {
          console.log('[Transfer STOMP Debug]', str)
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
      })

      // 연결 성공 핸들러
      client.onConnect = (frame) => {
        console.log('Transfer WebSocket 연결됨:', frame)

        // 연결 성공 후에만 ref에 저장
        stompClientRef.current = client

        // 구독 시작
        const subscription = client.subscribe('/user/queue/transfer-status', (message) => {
          const data = JSON.parse(message.body)
          console.log('양도 상태 업데이트:', data)

          // 필터링 추가 (안전성)
          if (data.reservationNumber === navState.reservationNumber) {
            if (data.status === 'COMPLETED') {
              navigate('/payment/result?type=transfer&status=success')
            } else if (data.status === 'FAILED' || data.status === 'CANCELED') {
              navigate('/payment/result?type=transfer&status=fail')
            }
          }
        })

        console.log('Transfer WebSocket 구독 완료:', subscription)
      }

      // 에러 핸들러들
      client.onStompError = (frame) => {
        console.error('Transfer WebSocket STOMP 에러:', frame.headers?.message)
      }

      client.onWebSocketError = (error) => {
        console.error('Transfer WebSocket 에러:', error)
      }

      client.onDisconnect = () => {
        console.log('Transfer WebSocket 연결 해제됨')
      }

      // 연결 시작
      try {
        client.activate()
        console.log('Transfer WebSocket 클라이언트 활성화 완료')
      } catch (error) {
        console.error('Transfer WebSocket 클라이언트 활성화 실패:', error)
      }
    }

    connectWebSocket()

    // cleanup 함수
    return () => {
      console.log('[Transfer WebSocket] cleanup 실행')
      if (stompClientRef.current?.connected) {
        console.log('[Transfer WebSocket] 연결 해제 중...')
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

  // 화면 표기용 금액(서버 검증에는 사용하지 않음)
  const amount = (navState.price ?? 0) * (navState.ticket ?? 1)
  const commision = Math.floor(amount*0.1)
  const totalAmount = amount + commision

  // 필수 파라미터 가드
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

  // 서버 기준 값(요청 바디에 사용할 값) — 반드시 서버에서 가져온 금액/ID를 사용해야 검증 통과
  const basePaymentId = basePayment?.paymentId
  const baseAmount = basePayment?.amount ?? 0

  // 화면 표시용 상품 요약
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

  // 다음 버튼 활성 상태: 지인은 basePaymentId가 준비되어야 함
  const needAddress = deliveryMethod === 'PAPER'
  const disabledNext = useMemo(() => {
    if (!deliveryMethod) return true
    const addressOk = needAddress ? isAddressFilled : true
    const othersOk =
      addressOk &&
      isAgreed &&
      openedMethod !== null &&
      !isBasePayLoading &&
      !!basePaymentId &&
      !isBasePayError
    return isFamily ? !addressOk : !othersOk
  }, [
    deliveryMethod,
    needAddress,
    isAddressFilled,
    isAgreed,
    openedMethod,
    isFamily,
    isBasePayLoading,
    isBasePayError,
    basePaymentId,
  ])

  // 양도 승인 DTO(가족/지인 공통)
  const buildApproveDTO = () => ({
    transferId: Number(navState.transferId),
    senderId: Number(navState.senderId),
    transferStatus: 'ACCEPTED' as const,
    deliveryMethod: deliveryMethod ?? null,
    address: deliveryMethod === 'PAPER' ? (address || '') : null,
  })

  // “다음” 확인: 가족은 즉시 승인, 지인은 transfer를 먼저 생성(기존 결제ID + 서버 금액)
  const handleAlertConfirm = async () => {
    setIsAlertOpen(false)
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      // 가족: 결제 없이 승인만 처리
      if (isFamily) {
        const dto = buildApproveDTO()
        await respondFamily.mutateAsync(dto)
        alert('성공적으로 티켓 양도를 받았습니다.')
        navigate('/mypage/ticket/history')
        return
      }

      // 지인: 비밀번호 모달 표시 (실제 결제는 모달 처리 이후)
      if (!userId) throw new Error('로그인이 필요합니다.')
      if (isBasePayLoading) throw new Error('결제 정보를 불러오는 중입니다.')
      if (!basePaymentId) throw new Error((basePayError as any)?.message || '기존 결제 정보를 찾을 수 없습니다.')

      // 비밀번호 입력
      setIsPwModalOpen(true)
    } catch (e: any) {
      console.log('[Transfer][handleAlertConfirm error]', e?.response?.data || e)
      const msg = e?.message || ''
      if (e?.response?.data?.errorMessage) {
        alert(e.response.data.errorMessage)
      } else {
        alert(msg || '오류남.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // 비번 입력 후 수수료, 양도 결제 모두 완료 -> 바로 결과 페이지로 이동
  const handlePasswordComplete = async (password: string) => {
    try {
      if (!userId || !basePaymentId) throw new Error('필수 정보가 없습니다.')

      // 양도 수수료 계산
      const RATE = Number(import.meta.env.VITE_TRANSFER_FEE_RATE ?? 0.1)
      const commission = Math.max(1, Math.floor(baseAmount * RATE))

      // 양도 결제 실행 (포인트 차감 + 양도 처리 + 수수료 처리)
      const transferReqBody: RequestTransferPaymentDTO = {
        sellerId: Number(navState.senderId) || 0,
        paymentId: basePaymentId, // db에 저장된 기존 결제 내역
        bookingId: navState.reservationNumber!,
        totalAmount: baseAmount,
        commission,
      }

      console.log('transfer 호출 payload', transferReqBody)
      // 실제 양도 결제 실행
      await requestTransferPayment(transferReqBody, userId)
      console.log('transfer api 성공')

      // 양도 승인 처리
      const approveDTO = buildApproveDTO()
      await respondOthers.mutateAsync(approveDTO)

      // ✅ WebSocket 메시지 누락 대비 추가
      setTimeout(() => {
        navigate('/payment/result?type=transfer&status=success')
      }, 2000)

    } catch (e: any) {
      console.log('[Transfer][handlePasswordComplete error]', e?.response?.data || e)
      const msg = e?.response?.data?.errorMessage || e?.message || '양도 처리에 실패했습니다.'
      alert(msg)
      navigate('/payment/result?type=transfer&status=fail')
    }
  }

  // 페이지 렌더
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
                      {/* 화면 표시용 금액은 그대로 유지(서버 검증에는 baseAmount 사용) */}
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

      {isAlertOpen && (
        <AlertModal title="안내" onCancel={() => setIsAlertOpen(false)} onConfirm={handleAlertConfirm}>
          {isFamily ? '가족 간 양도는 결제 없이 진행됩니다. 계속하시겠습니까?' : '승인 후 결제를 진행합니다. 계속하시겠습니까?'}
        </AlertModal>
      )}

      {/* 비가족: transfer 생성(basePaymentId 준비) 이후에만 모달 표시 - 검증만 수행 */}
      {!isFamily && isPwModalOpen && userId && basePaymentId && (
        <PasswordInputModal
          amount={baseAmount}            // 검증에는 서버 금액 사용
          paymentId={basePaymentId}
          userId={userId}
          onClose={() => setIsPwModalOpen(false)}
          onComplete={handlePasswordComplete} // 결제X, 승인만
        />
      )}
    </div>
  )
}

export default TransferPaymentPage
