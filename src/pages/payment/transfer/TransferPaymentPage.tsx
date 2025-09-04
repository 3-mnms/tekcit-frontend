// src/pages/payment/TransferPaymentPage.tsx 멍
// 주석: 양도 결제 페이지 — POST → STOMP 구독(연결=구독) → 타임아웃/close 시 폴백 확인 멍

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'

import BookingProductInfo from '@/components/payment/BookingProductInfo'       // 상품 요약 멍
import Button from '@/components/common/button/Button'                         // 버튼 멍
import AlertModal from '@/components/common/modal/AlertModal'                  // 알림 모달 멍
import PasswordInputModal from '@/components/payment/modal/PasswordInputModal' // 비번 모달 멍
import WalletPayment from '@/components/payment/pay/TekcitPay'                 // 킷페이 멍

import { useAuthStore } from '@/shared/storage/useAuthStore'                   // 로그인 상태 멍
import { createPaymentId } from '@/models/payment/utils/paymentUtils'          // 결제ID 유틸 멍

// ✅ transfer.ts에서 STOMP/SockJS + API 유틸들 가져오기 멍
//    경로가 프로젝트에 따라 '@/shared/api/transfer'일 수도 있음 → 파일 위치에 맞춰 조정 멍
import {
  getTransferSummary,            // 요약 조회 API 멍
  postTekcitpayTransfer,         // 양도 결제 시작 API 멍
  TransferWsMsgSchema,           // 웹소켓(STOMP) 메시지 검증 스키마 멍
  createStompClient,             // STOMP 클라이언트 생성 멍
  transferDestination,           // 구독 destination 생성 멍
  checkTransferStatus,           // 폴백 상태 조회 멍
} from '@/shared/api/payment/transfer'

import styles from './TransferPaymentPage.module.css'

type PayMethod = '킷페이' | '토스'

type TransferState = {
  transferId: number
  senderId: number
  transferStatus: 'ACCEPTED'
  relation: 'FAMILY' | 'OTHERS'
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
  const { search } = useLocation()

  // ✅ 쿼리 파라미터 멍
  const qs = new URLSearchParams(search)
  const transferId = qs.get('transferId')!            // 요약/구독 둘 다 필요 멍
  const bookingId = qs.get('bookingId')               // 결제 바디용 멍
  const sellerIdParam = qs.get('sellerId')            // 없으면 요약에서 보강 멍

  // ✅ 로그인 사용자 = buyerId (X-User-Id) 멍
  const user = useAuthStore((s) => s.user as any)
  const buyerId = useMemo(() => {
    const n = Number(user?.userId ?? user?.id)
    return Number.isFinite(n) && n > 0 ? n : null
  }, [user])

  // ✅ 결제ID(고정) 멍
  const paymentId = useMemo(() => createPaymentId(), [])

  // ✅ 요약 조회 멍(React Query) — 분리된 API 사용 멍
  const { data: summary, isLoading, isError, refetch } = useQuery({
    queryKey: ['transferSummary', transferId],
    enabled: !!transferId,
    queryFn: () => getTransferSummary(transferId), // 응답은 Zod로 내부 검증됨 멍
    staleTime: 60_000,
  })

  // ✅ 사용할 sellerId 결정(쿼리 > 요약 응답) 멍
  const effectiveSellerId = useMemo(() => {
    const q = Number(sellerIdParam)
    if (Number.isFinite(q) && q > 0) return q
    const s = Number(summary?.sellerId)
    if (Number.isFinite(s) && s > 0) return s
    return null
  }, [sellerIdParam, summary?.sellerId])

  // ✅ 상태 멍
  const [isAgreed, setIsAgreed] = useState(false)                      // 약관 동의 멍
  const [openedMethod, setOpenedMethod] = useState<Method | null>(null)// 결제수단 아코디언 멍
  const [isAlertOpen, setIsAlertOpen] = useState(false)                // 안내 모달 멍
  const [isPwModalOpen, setIsPwModalOpen] = useState(false)            // 비번 모달 멍

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
        routeToResult(true, { relation: 'FAMILY' })
      } else {
        if (wsEnabled && !stompRef.current?.active) {
          // 주석: 포그라운드 복귀 시 자동 재연결은 STOMP가 처리(reconnectDelay) 멍
        }
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [wsEnabled])

  // 주석: STOMP 시작/정지 헬퍼 멍
  const startSubscribe = (tid: string) => {
    // 기존 연결 정리 멍
    try { stompRef.current?.deactivate() } catch {}
    const client = createStompClient()
    stompRef.current = client

    client.onConnect = () => {
      const dest = transferDestination(tid) // ex) /topic/transfer/{id} 멍
      client.subscribe(dest, (frame) => {
        try {
          const json = JSON.parse(frame.body)           // 서버 메시지 파싱 멍
          const msg = TransferWsMsgSchema.parse(json)   // 스키마 검증 멍
          if (msg.success && msg.data === true) {
            setWsEnabled(false)
            try { client.deactivate() } catch {}
            navigate(`/payment/result?${new URLSearchParams({ type: 'transfer', status: 'success' }).toString()}`)
          }
          // 실패 신호 규약 존재 시 추가 분기 멍
        } catch (e) {
          console.error('[STOMP] 메시지 파싱 실패 멍:', e)
        }
      })
    }

    // 소켓 종료 시 1회 폴백 확인 멍
    client.onWebSocketClose = async () => {
      if (!wsEnabled) return
      try {
        const res = await checkTransferStatus(tid)
        setWsEnabled(false)
        if (res.success && res.data === true) {
          navigate(`/payment/result?${new URLSearchParams({ type: 'transfer', status: 'success' }).toString()}`)
        } else {
          navigate(`/payment/result?${new URLSearchParams({ type: 'transfer', status: 'fail' }).toString()}`)
        }
      } catch {
        // 재연결은 STOMP의 reconnectDelay가 처리 멍(여기서는 결과 페이지로 보내지 않음) 멍
      }
    }

    client.activate() // 연결 시작 멍
  }

  // 언마운트 시 정리 멍
  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
      try { stompRef.current?.deactivate() } catch {}
      stompRef.current = null
    }
  }, [])

  // ✅ 다음 버튼 활성 조건 멍
  const disabledNext = useMemo(
    () => !(summary && !isLoading && !isError && isAgreed && openedMethod && buyerId && effectiveSellerId && bookingId),
    [summary, isLoading, isError, isAgreed, openedMethod, buyerId, effectiveSellerId, bookingId]
  )

  // ✅ 모달 핸들러 멍
  const handleAlertConfirm = () => { setIsAlertOpen(false); setIsPwModalOpen(true) }
  const handleAlertCancel  = () => setIsAlertOpen(false)

  // ✅ 비밀번호 입력 완료 → 결제 POST → STOMP 구독 + 타임아웃 폴백 멍
  const handlePasswordComplete = async (password: string) => {
    console.log('[KitPay] 입력 비밀번호:', password) // 디버그 멍
    setIsPwModalOpen(false)
    try {
      await transferMutation.mutateAsync()  // 결제 백으로 시작 멍
      setWsEnabled(true)                    // 구독 활성 플래그 멍
      startSubscribe(transferId!)           // STOMP 구독 시작 멍

      // ⬇️ 타임아웃 폴백: 60초 동안 메시지 못 받으면 REST로 최종 확인 멍
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(async () => {
        if (!wsEnabled) return // 이미 성공/실패 처리됨 멍
        try {
          const res = await checkTransferStatus(transferId!)
          setWsEnabled(false)
          try { stompRef.current?.deactivate() } catch {}
          navigate(`/payment/result?${new URLSearchParams({
            type: 'transfer',
            status: res.success && res.data === true ? 'success' : 'fail'
          }).toString()}`)
        } catch {
          setWsEnabled(false)
          try { stompRef.current?.deactivate() } catch {}
          navigate(`/payment/result?${new URLSearchParams({ type: 'transfer', status: 'fail' }).toString()}`)
        }
      }, 60_000) as unknown as number
    } catch {
      navigate(`/payment/result?${new URLSearchParams({ type: 'transfer', status: 'fail' }).toString()}`)
    }
  }

  // ✅ 에러/가드 멍
  const showError = isError || !transferId || !bookingId || !buyerId || !effectiveSellerId
  const errorMessage =
    !transferId ? '잘못된 접근입니다. transferId가 없습니다.'
    : !bookingId ? '잘못된 접근입니다. bookingId가 없습니다.'
    : !buyerId ? '로그인이 필요합니다.'
    : !effectiveSellerId ? '양도자 정보(sellerId)를 확인할 수 없습니다.'
    : '요약 정보를 불러오지 못했습니다. 다시 시도해 주세요.'

  return (
    <div className={styles.page}>
      {/* 상단 헤더 멍 */}
      <header className={styles.header}>
        <h1 className={styles.title}>양도 주문서</h1>
      </header>

      {/* 오류 배너 멍 */}
      {showError && (
        <section className={styles.card}>
          <div className={styles.errorBox}>
            <p>{errorMessage}</p>
            {transferId && !isError && !summary && <Button onClick={() => refetch()}>다시 불러오기</Button>}
          </div>
        </section>
      )}

      {/* 로딩 멍 */}
      {isLoading && (
        <section className={styles.card}>
          <p>요약 정보를 불러오는 중…</p>
        </section>
      )}

      {/* 본문 멍 */}
      {summary && !isLoading && !isError && buyerId && effectiveSellerId && bookingId && (
        <>
          <div className={styles.layout}>
            <main className={styles.main}>
              {/* 상품(티켓) 정보 멍 */}
              <section className={styles.card}>
                <BookingProductInfo
                  title={summary.festivalTitle}
                  dateTimeLabel={formatKoreanDateTime(summary.festivalDate)}
                  quantity={summary.quantity}
                  unitPrice={summary.unitPrice}
                />
              </section>

              {/* 결제 수단 — 킷페이 멍 */}
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>결제 수단</h2>
                <div className={styles.paymentBox}>
                  <div className={`${styles.methodCard} ${openedMethod === '킷페이' ? styles.active : ''}`}>
                    <button
                      className={styles.methodHeader}
                      onClick={() => setOpenedMethod('킷페이')}
                      aria-expanded={openedMethod === '킷페이'}
                    >
                      <span className={`${styles.radio} ${openedMethod === '킷페이' ? styles.radioOn : ''}`} />
                      <span className={styles.methodText}>킷페이 (포인트 결제)</span>
                    </button>

                    {openedMethod === '킷페이' && (
                      <div className={styles.methodBody}>
                        <WalletPayment
                          isOpen
                          onToggle={() => setOpenedMethod('킷페이')}
                          dueAmount={totalAmount}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </main>

            {/* 오른쪽 요약/CTA 멍 */}
            <aside className={styles.sidebar}>
              <div className={styles.sticky}>
                <section className={`${styles.card} ${styles.summaryCard}`} aria-label="결제 요약">
                  <h2 className={styles.cardTitle}>결제 요약</h2>

                  <div className={styles.priceRow}>
                    <span>티켓 1매 가격</span>
                    <span className={styles.priceValue}>{summary.unitPrice.toLocaleString()}원</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>수량</span>
                    <span className={styles.priceValue}>{summary.quantity.toLocaleString()}매</span>
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
                    disabled={!(openedMethod && isAgreed) || transferMutation.isPending || wsEnabled}
                    className={styles.nextBtn}
                    aria-label="다음 단계로 이동"
                    onClick={() => setIsAlertOpen(true)}
                  >
                    {transferMutation.isPending ? '처리 중…' : wsEnabled ? '결제 확인 중…' : '다음'}
                  </Button>
                </section>
              </div>
            </aside>
          </div>

          {/* 모달들 멍 */}
          {isAlertOpen && (
            <AlertModal title="결제 안내" onCancel={() => setIsAlertOpen(false)} onConfirm={() => setIsPwModalOpen(true)}>
              양도로 구매한 티켓은 환불 불가합니다. 계속 진행하시겠습니까?
            </AlertModal>
          )}
          {isPwModalOpen && (
            <PasswordInputModal onClose={() => setIsPwModalOpen(false)} onComplete={handlePasswordComplete} />
          )}
        </>
      )}
    </div>
  )
}

export default TransferPaymentPage
