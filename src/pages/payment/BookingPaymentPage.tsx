// src/pages/payment/BookingPaymentPage.tsx
import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

import type { TossPaymentHandle } from '@/components/payment/pay/TossPayment'
import PaymentInfo from '@/components/payment/pay/PaymentInfo'
import BookingPaymentHeader from '@/components/payment/pay/BookingPaymentHeader'
import ReceiveInfo from '@/components/payment/delivery/ReceiveInfo'

import Button from '@/components/common/button/Button'
import PasswordInputModal from '@/components/payment/modal/PasswordInputModal'
import AlertModal from '@/components/common/modal/AlertModal'

import { useAuthStore } from '@/shared/storage/useAuthStore'
import PaymentSection from '@/components/payment/pay/PaymentSection'
import type { CheckoutState, PaymentMethod } from '@/models/payment/types/paymentTypes'
import { createPaymentId } from '@/models/payment/utils/paymentUtils'
import { saveBookingSession } from '@/shared/api/payment/paymentSession'
import { fetchBookingDetail } from '@/shared/api/payment/bookingDetail'

import { requestPayment, type PaymentRequestDTO } from '@/shared/api/payment/payments'
import { useTokenInfoQuery } from '@/shared/api/useTokenInfoQuery'
import { useReleaseWaitingMutation } from '@/models/waiting/tanstack-query/useWaiting'

import styles from './BookingPaymentPage.module.css'

const DEADLINE_SECONDS = 5 * 60

const parseYMD = (s?: string) => {
  if (!s) return undefined
  const t = s.trim().replace(/[./]/g, '-')
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t)
  const d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(t)
  if (isNaN(d.getTime())) return undefined
  d.setHours(0, 0, 0, 0)
  return d
}
const combineDateTime = (day?: Date, hhmm?: string | null) => {
  if (!day) return undefined
  const d = new Date(day)
  if (!hhmm) {
    d.setHours(0, 0, 0, 0)
    return d
  }
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm)
  if (!m) return d
  d.setHours(Math.min(23, +m[1] || 0), Math.min(59, +m[2] || 0), 0, 0)
  return d
}

const BookingPaymentPage: React.FC = () => {
  const stompClientRef = useRef<any>(null)

  const navigate = useNavigate()
  const { state } = useLocation()
  const checkout = state as CheckoutState

  const unitPrice = checkout?.unitPrice ?? 0
  const quantity = checkout?.quantity ?? 0
  const finalAmount = useMemo(() => unitPrice * quantity, [unitPrice, quantity])
  const orderName = useMemo(() => checkout?.title, [checkout?.title])
  const festivalIdVal = checkout?.festivalId

  const [sellerId, setSellerId] = useState<number | null>(null)
  const storeName = useAuthStore((s) => s.user?.name) || undefined
  const userName = useMemo(() => storeName ?? getNameFromJwt(), [storeName])

  const tossRef = useRef<TossPaymentHandle>(null)
  const [openedMethod, setOpenedMethod] = useState<PaymentMethod | null>(null)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [ensuredPaymentId, setEnsuredPaymentId] = useState<string | null>(null)

  const { data: tokenInfo } = useTokenInfoQuery()
  const userId = Number(tokenInfo?.userId)

  const amountToPay = finalAmount ?? checkout.amount

  const [isTimeUpModalOpen, setIsTimeUpModalOpen] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [remainingSeconds, setRemainingSeconds] = useState(DEADLINE_SECONDS)

  // 최초 paymentId 생성 + 세션 저장
  useEffect(() => {
    if (!paymentId) {
      const id = createPaymentId()
      setPaymentId(id)
      if (checkout?.bookingId && checkout?.festivalId && sellerId) {
        saveBookingSession({
          paymentId: id,
          bookingId: checkout.bookingId,
          festivalId: checkout.festivalId,
          sellerId,
          amount: finalAmount,
          createdAt: Date.now(),
        })
      }
    }
  }, [paymentId, checkout, finalAmount, sellerId])

  // sellerId 확보
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetchBookingDetail({
          festivalId: checkout.festivalId,
          performanceDate: checkout.performanceDate,
          reservationNumber: checkout.bookingId,
        })
        if (!res.success) throw new Error(res.message || '상세 조회 실패')
        const sid = (res.data?.sellerId ?? res.data?.sellerId) as number | undefined
        if (!sid) throw new Error('sellerId 누락')
        setSellerId(sid)
      } catch (e) {
        // console.error('예매 상세 조회 실패', e)
        // alert('결제 정보를 불러오지 못했습니다.')
        // navigate(-1)
      }
    })()
  }, [checkout?.festivalId, checkout?.performanceDate, checkout?.bookingId, navigate])

  // 웹소켓 연결 (결제 완료 알림)
  useEffect(() => {
    console.log('[WebSocket] 초기화 시작, bookingId:', checkout?.bookingId)

    if (!checkout?.bookingId) {
      console.log('[WebSocket] bookingId 없음, 연결하지 않음')
      return
    }

    // 기존 연결이 있으면 먼저 정리
    if (stompClientRef.current?.connected) {
      console.log('[WebSocket] 기존 연결 해제 중...')
      stompClientRef.current.deactivate()
      stompClientRef.current = null
    }

    const connectWebSocket = () => {
      console.log('[WebSocket] 새 연결 시작...')
      console.log('[WebSocket] 연결 URL: http://localhost:10000/ws') // ✅ 포트 수정

      // ✅ 최신 @stomp/stompjs Client 방식 사용
      const client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:10000/ws'), // ✅ 포트 수정
        connectHeaders: {},
        debug: (str) => {
          console.log('[STOMP Debug]', str)
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
      })

      // 연결 성공 핸들러
      client.onConnect = (frame) => {
        console.log('✅ [WebSocket] STOMP 연결 성공:', frame)
        console.log('[WebSocket] 연결된 세션:', frame.headers?.session)

        // 연결 성공 후에만 ref에 저장
        stompClientRef.current = client

        // 구독 시작
        console.log('[WebSocket] 구독 시작: /user/queue/ticket-status')
        const subscription = client.subscribe('/user/queue/ticket-status', (message) => {
          console.log('📨 [WebSocket] 메시지 수신 - Raw:', message)
          console.log('📨 [WebSocket] 메시지 본문:', message.body)

          try {
            const data = JSON.parse(message.body)
            console.log('[WebSocket] 파싱된 데이터:', data)

            if (data.status === 'CONFIRMED') {
              console.log('✅ [WebSocket] 결제 완료 - 성공 페이지로 이동')
              navigate('/payment/result?type=booking&status=success')
            } else if (data.status === 'CANCELED') {
              console.log('❌ [WebSocket] 결제 취소 - 실패 페이지로 이동')
              navigate('/payment/result?type=booking&status=fail')
            } else {
              console.log('ℹ️ [WebSocket] 기타 상태:', data.status)
            }
          } catch (parseError) {
            console.error('❌ [WebSocket] 메시지 파싱 실패:', parseError)
            console.error('[WebSocket] 원본 메시지:', message.body)
          }
        })

        console.log('✅ [WebSocket] 구독 완료, subscription:', subscription)

        // 테스트 메시지 전송
        setTimeout(() => {
          try {
            client.publish({
              destination: '/app/test',
              body: JSON.stringify({
                type: 'connection-test',
                bookingId: checkout?.bookingId,
                timestamp: new Date().toISOString()
              })
            })
            console.log('📤 [WebSocket] 테스트 메시지 전송 완료')
          } catch (error) {
            console.error('❌ [WebSocket] 테스트 메시지 전송 실패:', error)
          }
        }, 1000)
      }

      // 에러 핸들러들
      client.onStompError = (frame) => {
        console.error('❌ [WebSocket] STOMP 프로토콜 에러:', frame.headers?.message)
        console.error('[WebSocket] 에러 본문:', frame.body)
      }

      client.onWebSocketError = (error) => {
        console.error('❌ [WebSocket] WebSocket 에러:', error)
      }

      client.onWebSocketClose = (event) => {
        console.log('🔌 [WebSocket] WebSocket 연결 종료:', event)
      }

      client.onDisconnect = () => {
        console.log('🔌 [WebSocket] STOMP 연결 해제됨')

        // 5초 후 재연결 시도
        setTimeout(() => {
          console.log('[WebSocket] 5초 후 재연결 시도...')
          connectWebSocket()
        }, 5000)
      }

      // 연결 시작
      try {
        client.activate()
        console.log('[WebSocket] 클라이언트 활성화 완료')
      } catch (error) {
        console.error('❌ [WebSocket] 클라이언트 활성화 실패:', error)
      }
    }

    connectWebSocket()

    // cleanup 함수
    return () => {
      console.log('[WebSocket] cleanup 실행')
      if (stompClientRef.current?.connected) {
        console.log('[WebSocket] 연결 해제 중...')
        stompClientRef.current.deactivate()
        stompClientRef.current = null
      }
    }
  }, [checkout?.bookingId, navigate])

  const releaseMut = useReleaseWaitingMutation()
  const releasedOnceRef = useRef(false)

  const reservationDate = useMemo(() => {
    const day = parseYMD(checkout?.performanceDate)
    return combineDateTime(day, (checkout as any)?.performanceTime ?? null)
  }, [checkout?.performanceDate, (checkout as any)?.performanceTime])

  const callReleaseOnce = (why: string) => {
    if (releasedOnceRef.current) return
    if (!checkout?.festivalId || !reservationDate) return // 정보 없으면 skip
    releasedOnceRef.current = true
    releaseMut.mutate({
      festivalId: String(checkout.festivalId),
      reservationDate,
    })
    // (선택) 디버깅 로그
    console.log('[waiting.release] fired:', why, {
      festivalId: checkout.festivalId,
      reservationDate: reservationDate.toISOString(),
    })
  }

  const handleTimeUpModalClose = () => setIsTimeUpModalOpen(false)
  const routeToResult = (ok: boolean) => {
    callReleaseOnce(ok ? 'routeToResult:success' : 'routeToResult:fail')
    navigate(`/payment/result?type=booking&status=${ok ? 'success' : 'fail'}`)
  }

  const toggleMethod = (m: PaymentMethod) => {
    if (isPaying || remainingSeconds <= 0) return
    setOpenedMethod((prev) => (prev === m ? null : m))
    setErr(null)
  }

  // request → (wallet) 모달(tekcitpay) → (완료 라우팅)  ※ complete 호출 없음
  const handlePayment = async () => {
    // if (!checkout) {
    //   setErr('결제 정보를 불러오지 못했어요. 처음부터 다시 진행해주세요.')
    //   return
    // }
    if (!openedMethod) {
      setErr('결제 수단을 선택해주세요.')
      return
    }
    if (remainingSeconds <= 0) {
      setErr('결제 시간이 만료되었습니다.')
      setIsTimeUpModalOpen(true)
      return
    }
    if (isPaying) return

    // paymentId 고정
    const ensuredId = ensuredPaymentId ?? paymentId ?? createPaymentId()
    if (!ensuredPaymentId) setEnsuredPaymentId(ensuredId)
    if (!paymentId) setPaymentId(ensuredId)

    if (!Number.isFinite(userId)) {
      setErr('로그인이 필요합니다.')
      return
    }
    if (!sellerId) {
      setErr('판매자 정보가 없어요. 다시 시도해 주세요.')
      return
    }

    // 1) REQUEST (지갑은 'POINT_PAYMENT', 카드/토스는 'CARD')
    const dto: PaymentRequestDTO = {
      paymentId: ensuredId,
      bookingId: checkout.bookingId ?? null,
      festivalId: checkout.festivalId ?? null,
      paymentRequestType:
        openedMethod === 'wallet' ? 'POINT_PAYMENT_REQUESTED' : 'GENERAL_PAYMENT_REQUESTED',
      buyerId: userId!,
      sellerId: sellerId!,
      amount: finalAmount,
      currency: 'KRW',
      payMethod: openedMethod === 'wallet' ? 'POINT_PAYMENT' : 'CARD',
    }

    setIsPaying(true)
    try {
      await requestPayment(dto, userId!)
    } catch (e: any) {
      console.error('[requestPayment] failed', e?.response?.status, e?.response?.data)
      setErr('결제 준비에 실패했어요. 잠시 후 다시 시도해 주세요.')
      setIsPaying(false)
      return
    }

    // 2) 지갑이면 비번 모달 열기 → 모달에서 tekcitpay 성공 시 바로 성공 라우팅
    if (openedMethod === 'wallet') {
      setIsPaying(false)
      setIsPasswordModalOpen(true)
      return
    }

    // 2') 카드/토스는 PG 이동 (결과 페이지에서 별도 처리)
    try {
      sessionStorage.setItem(
        'tekcit:waitingRelease',
        JSON.stringify({
          festivalId: checkout.festivalId,
          performanceDate: checkout.performanceDate, // "YYYY-MM-DD"
          performanceTime: (checkout as any)?.performanceTime ?? null, // "HH:mm" | null
        }),
      )
      
      await tossRef.current?.requestPay({
        paymentId: ensuredId,
        amount: finalAmount,
        orderName,
        bookingId: checkout.bookingId,
        festivalId: festivalIdVal,
        sellerId: sellerId!,
        successUrl: `${window.location.origin}/payment/result?type=booking&status=success`,
        failUrl: `${window.location.origin}/payment/result?type=booking&status=fail`,
      })
    } catch {
      setErr('결제 요청 중 오류가 발생했어요.')
      routeToResult(false)
    } finally {
      setIsPaying(false)
    }
  }
  
  return (
    <div className={styles.page}>
      <BookingPaymentHeader
        initialSeconds={DEADLINE_SECONDS}
        onTick={(sec) => setRemainingSeconds(sec)}
        onExpire={() => setIsTimeUpModalOpen(true)}
      />

      <div className={styles.container} role="main">
        {/* 좌측 */}
        <section className={styles.left}>
          <div className={styles.sectionContainer}>
            <div className={styles.receiveSection}>
              <h2 className={styles.sectionTitle}>수령 방법</h2>
              <ReceiveInfo rawValue={checkout.deliveryMethod} />
            </div>

            <div>
              <h2 className={styles.sectionTitle}>결제 수단</h2>
              <PaymentSection
                ref={tossRef}
                openedMethod={openedMethod}
                onToggle={toggleMethod}
                amount={finalAmount}
                orderName={orderName}
                errorMsg={err}
                bookingId={checkout.bookingId}
                festivalId={checkout.festivalId}
                sellerId={sellerId}
              />
            </div>
          </div>
        </section>

        {/* 우측 */}
        <aside className={styles.right}>
          <div className={styles.summaryCard}>
            <PaymentInfo />
          </div>
          <div className={styles.buttonWrapper}>
            <Button
              type="button"
              className={styles.payButton}
              onClick={handlePayment}
              aria-busy={isPaying}
            >
              {isPaying ? '결제 중...' : '결제하기'}
            </Button>
          </div>
        </aside>
      </div>

      {/* 지갑 비밀번호 모달: tekcitpay 성공 시 바로 라우팅 (complete 호출 X) */}
      {isPasswordModalOpen && ensuredPaymentId && Number.isFinite(userId) && (
        <PasswordInputModal
          amount={amountToPay}
          paymentId={ensuredPaymentId}
          userName={userName}
          userId={userId as number}
          onClose={() => setIsPasswordModalOpen(false)}
          onComplete={() => {
            // WebSocket 메시지 누락 대비 - 2초 후 자동 이동
            setTimeout(() => {
              navigate('/payment/result?type=booking&status=success')
            }, 2000)

            setIsPasswordModalOpen(false)
          }}
        />
      )}

      {isTimeUpModalOpen && (
        <AlertModal
          title="시간 만료"
          onConfirm={() => {
            setIsTimeUpModalOpen(false)
            if (window.opener && !window.opener.closed) {
              window.close()
            }
          }}
          hideCancel
        >
          결제 시간이 만료되었습니다. 다시 시도해주세요.
        </AlertModal>
      )}
    </div>
  )
}

export default BookingPaymentPage
