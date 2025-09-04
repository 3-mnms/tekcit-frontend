// src/pages/payment/TransferPaymentPage.tsx
// 목적: 양도 결제 페이지. 가족(FAMILY)은 무료 처리, 지인(OTHERS)은 킷페이 결제만 지원
// 흐름: 다음 클릭 → 양도 승인 POST → (지인) 양도 결제 요청 POST → 비밀번호 입력 → 킷페이 결제 POST → 수수료 결제 페이지로 이동

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'

import BookingProductInfo from '@/components/payment/BookingProductInfo'
import Button from '@/components/common/button/Button'
import AlertModal from '@/components/common/modal/AlertModal'
import PasswordInputModal from '@/components/payment/modal/PasswordInputModal'
import WalletPayment from '@/components/payment/pay/TekcitPay'

import {
  requestTekcitPayment,       // 양도 결제 요청(POST /api/payments/request)
  verifyTekcitPassword,       // 킷페이 결제(POST /api/tekcitpay)
  confirmTekcitPayment,       // 결제 완료(POST /api/payments/complete/{paymentId})
} from '@/shared/api/payment/tekcit'

import {
  useRespondFamilyTransfer,
  useRespondOthersTransfer,
} from '@/models/transfer/tanstack-query/useTransfer'

import { createPaymentId } from '@/models/payment/utils/paymentUtils'

import { Client } from '@stomp/stompjs'
import type { IMessage } from '@stomp/stompjs'
// 브라우저 엔트리로 import하여 global 이슈 회피
import SockJS from 'sockjs-client/dist/sockjs'

import styles from './TransferPaymentPage.module.css'

// 네비게이션으로 전달받는 상태
type TransferState = {
  transferId: number
  senderId: number
  bookingId?: number
  transferStatus: 'ACCEPTED'
  relation: 'FAMILY' | 'OTHERS'
  reservationNumber?: string
  title?: string
  datetime?: string
  location?: string
  ticket?: number
  price?: number
  posterFile?: string
  festivalId?: number
}

const TransferPaymentPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const navState = (location.state ?? {}) as Partial<TransferState>

  // relation 보정
  const relation: 'FAMILY' | 'OTHERS' =
    navState.relation === 'FAMILY' || navState.relation === 'OTHERS'
      ? navState.relation
      : 'OTHERS'
  const isFamily = relation === 'FAMILY'

  // 서버 훅(양도 승인)
  const respondFamily = useRespondFamilyTransfer()
  const respondOthers = useRespondOthersTransfer()

  // UI 상태
  const [isAgreed, setIsAgreed] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [isPwModalOpen, setIsPwModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 결제 및 소켓 상태
  const paymentIdRef = useRef<string | null>(null)
  const stompRef = useRef<Client | null>(null)
  const wsDoneRef = useRef<(v: boolean) => void>()

  // 필수 파라미터 검증
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

  // 결제 금액 계산
  const amount = (navState.price ?? 0) * (navState.ticket ?? 1)

  // 상품 표시용 정보
  const productInfo = {
    title: navState.title,
    datetime: navState.datetime,
    location: navState.location,
    ticket: navState.ticket,
    price: navState.price,
    relation,
    posterFile: navState.posterFile,
  }

  // bookingId 소스 결정(없으면 reservationNumber 사용)
  const bookingIdStr = String(
    navState.bookingId ?? navState.reservationNumber ?? ''
  )

  // 결과 페이지 이동 유틸
  const routeToResult = (ok: boolean, extra?: Record<string, string | undefined>) => {
    const params = new URLSearchParams({
      type: 'transfer',
      status: ok ? 'success' : 'fail',
      ...(extra ?? {}),
    })
    navigate(`/payment/result?${params.toString()}`)
  }

  // 버튼 활성화 조건(지인은 약관 동의만 필요)
  const disabledNext = useMemo(() => {
    if (isFamily) return false
    return !isAgreed
  }, [isAgreed, isFamily])

  // 양도 승인 DTO 생성
  const buildApproveDTO = () => ({
    transferId: Number(navState.transferId),
    senderId: Number(navState.senderId),
    transferStatus: 'ACCEPTED' as const,
  })

  // 양도 결제 요청 뮤테이션 (POST /api/payments/request)
  const paymentRequestMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      console.debug('[payment request] paymentId:', paymentId)
      return await requestTekcitPayment({
        paymentId,
        bookingId: bookingIdStr,
        festivalId: String(navState.festivalId ?? ''),
        sellerId: Number(navState.senderId),
        amount: amount,
      })
    },
  })

  // ✅ 킷페이 결제 뮤테이션 (POST /api/tekcitpay)
  const tekcitPayMutation = useMutation({
    mutationFn: async ({ paymentId, password }: { paymentId: string; password: string }) => {
      if (!paymentId) throw new Error('paymentId가 없습니다.')
      if (!amount || amount <= 0) throw new Error('amount가 유효하지 않습니다.')

      console.log('💳 /api/tekcitpay body(masked):', {
        paymentId,
        amount,
        password: '******',
      })

      return verifyTekcitPassword({
        paymentId,
        amount,
        password: String(password).trim(),
      })
    },
  })

  // ✅ 결제 완료 뮤테이션 (POST /api/payments/complete/{paymentId})
  const completeMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      if (!paymentId) throw new Error('paymentId가 없습니다.')
      console.debug('[payment complete] paymentId:', paymentId)
      return confirmTekcitPayment(paymentId)
    },
  })

  // STOMP/SockJS 연결 후 결제 완료 신호 대기
  function connectAndWaitPayment(paymentId: string, timeoutMs = 15000): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      try { stompRef.current?.deactivate() } catch { }
      wsDoneRef.current = resolve

      const WS_ENDPOINT = import.meta.env.VITE_WS_ENDPOINT ?? '/ws'
      const TOPIC_BASE = import.meta.env.VITE_WS_TOPIC_BASE ?? '/topic/payments'
      const candidates = [
        `${TOPIC_BASE}/${paymentId}`,
        `${TOPIC_BASE}.${paymentId}`,
      ]

      console.debug('[WS connect]', WS_ENDPOINT, 'topics:', candidates)

      const client = new Client({
        webSocketFactory: () => new SockJS(WS_ENDPOINT),
        reconnectDelay: 0,
        onConnect: () => {
          console.debug('[WS connected]')
          candidates.forEach(topic => {
            console.debug('[WS subscribe]', topic)
            client.subscribe(topic, (msg: IMessage) => {
              console.debug('[WS message]', msg.body)
              try {
                const payload = JSON.parse(msg.body)
                const ok = !!(payload?.success || payload?.status === 'COMPLETED')
                cleanup(ok)
              } catch {
                cleanup(false)
              }
            })
          })
        },
        onStompError: (f) => { console.warn('[WS stomp error]', f?.headers, f?.body); cleanup(false) },
        onWebSocketClose: () => { console.debug('[WS closed]') },
      })

      stompRef.current = client
      client.activate()

      const to = setTimeout(() => { console.warn('[WS timeout]'); cleanup(false) }, timeoutMs)

      function cleanup(ok: boolean) {
        try { clearTimeout(to) } catch { }
        try { client.deactivate() } catch { }
        if (wsDoneRef.current) {
          const done = wsDoneRef.current
          wsDoneRef.current = undefined
          done(ok)
        }
      }
    })
  }

  // 언마운트 시 소켓 정리
  useEffect(() => {
    return () => { try { stompRef.current?.deactivate() } catch { } }
  }, [])

  // 다음 버튼 → 승인 및 결제 시작
  const handleAlertConfirm = async () => {
    setIsAlertOpen(false)
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const dto = buildApproveDTO()
      console.debug('[approveDTO]', dto, 'relation:', relation)

      if (isFamily) {
        console.debug('[family] respondFamily.mutateAsync')
        await respondFamily.mutateAsync(dto)
        alert('성공적으로 티켓 양도를 받았습니다.')
        navigate('/mypage/ticket/history')
        return
      }

      console.debug('[others] respondOthers.mutateAsync')
      await respondOthers.mutateAsync(dto)

      // 결제ID 생성 후 양도 결제 요청
      const paymentId = createPaymentId()
      console.debug('[generated paymentId]', paymentId)
      paymentIdRef.current = paymentId
      console.debug('[stored in ref]', paymentIdRef.current)

      // 1단계: 결제 요청 등록
      await paymentRequestMutation.mutateAsync(paymentId)
      console.debug('[after payment request, ref value]', paymentIdRef.current)

      // 비밀번호 입력 모달 오픈
      setIsPwModalOpen(true)
    } catch (e) {
      console.error('[handleAlertConfirm error]', e)
      alert('양도 처리 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 비밀번호 입력 완료 → 킷페이 결제 → 결제완료 POST → WS 완료 대기 → 결과 이동
  const handlePasswordComplete = async (password: string) => {
    console.debug('[pw complete] length:', password?.length)
    setIsPwModalOpen(false)
    const paymentId = paymentIdRef.current
    if (!paymentId) {
      console.warn('[no paymentId]')
      routeToResult(false, { relation: 'OTHERS' })
      return
    }

    try {
      // WebSocket 연결 시작
      const wsPromise = connectAndWaitPayment(paymentId)

      // 2단계: 킷페이 결제 (비밀번호 검증 + 포인트 차감)
      await tekcitPayMutation.mutateAsync({ paymentId, password })

      // 3단계: 결제 완료 처리
      await completeMutation.mutateAsync(paymentId)

      // WebSocket 신호 대기
      const ok = await wsPromise
      routeToResult(ok, { relation: 'OTHERS', paymentId })
    } catch (e) {
      console.error('[payment flow error]', e)
      routeToResult(false, { relation: 'OTHERS', paymentId })
    }
  }

  // 렌더
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

          {/* 결제: 킷페이만, 항상 펼쳐서 표시 */}
          {!isFamily && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>결제</h2>
              <div className={styles.paymentBox}>
                <div className={`${styles.methodCard} ${styles.active}`}>
                  <div className={styles.methodHeader} aria-expanded>
                    <span className={`${styles.radio} ${styles.radioOn}`} />
                    <span className={styles.methodText}>킷페이 (포인트 결제)</span>
                  </div>
                  <div className={styles.methodBody}>
                    <WalletPayment isOpen onToggle={() => { }} dueAmount={amount} />
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>

        {/* 우측 요약 */}
        <aside className={styles.sidebar}>
          <div className={styles.sticky}>
            {!isFamily && (
              <section className={`${styles.card} ${styles.summaryCard}`}>
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
                <label className={styles.agree}>
                  <input
                    type="checkbox"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                  />
                  <span>(필수) 양도 서비스 이용약관 및 개인정보 수집·이용에 동의합니다.</span>
                </label>
                <Button
                  disabled={disabledNext || isSubmitting}
                  className={styles.nextBtn}
                  onClick={() => {
                    console.debug('[click next] disabled?', disabledNext, 'isFamily?', isFamily)
                    setIsAlertOpen(true)
                  }}
                >
                  {isSubmitting ? '처리 중…' : '다음'}
                </Button>
              </section>
            )}

            {isFamily && (
              <section className={`${styles.card} ${styles.summaryCard}`}>
                <h2 className={styles.cardTitle}>가족 양도</h2>
                <p className={styles.freeDesc}>
                  가족 간 양도는 <strong>무료</strong>로 진행됩니다.
                </p>
                <div className={styles.priceRow}>
                  <span>티켓 가격</span>
                  <span className={styles.priceValue}>{amount.toLocaleString()}원</span>
                </div>
                <Button
                  disabled={disabledNext || isSubmitting}
                  className={styles.nextBtn}
                  onClick={() => {
                    console.debug('[click next family]')
                    setIsAlertOpen(true)
                  }}
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