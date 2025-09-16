import React, { useEffect, useMemo, useState, useCallback } from 'react'
import styles from './TransferTicketPage.module.css'
import { useNavigate } from 'react-router-dom'
import { useTransferTicketsQuery } from '@/models/my/ticket/tanstack-query/useTickets'
import {
  useWatchTransferQuery,
  useRespondFamilyTransfer,
  useRespondOthersTransfer,
  useTransferor,
} from '@/models/transfer/tanstack-query/useTransfer'

import BeforeTransferTicket from '@/components/my/ticket/BeforeTransferTicket'
import AfterTransferTicket from '@/components/my/ticket/AfterTransferTicket'

export const TRANSFER_DONE_EVENT = 'ticket:transferred'

const fmtDate = (iso?: string) => {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const fmtTime = (iso?: string) => {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

const toRelationLabel = (t: unknown): '가족' | '지인' => {
  if (typeof t === 'number') return t === 0 ? '가족' : '지인'
  if (typeof t === 'string') {
    const v = t.trim().toUpperCase()
    if (v === 'FAMILY' || v === '0') return '가족'
    if (v === 'OTHERS' || v === '1') return '지인'
  }
  return '지인'
}
const toType = (t: unknown): 'FAMILY' | 'OTHERS' => {
  if (typeof t === 'number') return t === 0 ? 'FAMILY' : 'OTHERS'
  if (typeof t === 'string') {
    const v = t.trim().toUpperCase()
    if (v === 'FAMILY' || v === '0') return 'FAMILY'
    if (v === 'OTHERS' || v === '1') return 'OTHERS'
  }
  return 'OTHERS'
}

const normalizeServerStatus = (v: unknown): 'REQUESTED' | 'APPROVED' | 'COMPLETED' | 'CANCELED' => {
  if (typeof v === 'number') {
    return (['REQUESTED', 'APPROVED', 'COMPLETED', 'CANCELED'][v] ?? 'REQUESTED') as any
  }
  if (typeof v === 'string') {
    const s = v.trim().toUpperCase()
    if (s === '0') return 'REQUESTED'
    if (s === '1') return 'APPROVED'
    if (s === '2') return 'COMPLETED'
    if (s === '3') return 'CANCELED'
    if (['REQUESTED', 'APPROVED', 'COMPLETED', 'CANCELED'].includes(s)) return s as any
  }
  return 'REQUESTED'
}
const toUiStatusLabel = (s: ReturnType<typeof normalizeServerStatus>): '양도 요청' | '양도 승인' | '양도 거부' => {
  switch (s) {
    case 'REQUESTED':
    case 'APPROVED':
      return '양도 요청'
    case 'COMPLETED':
      return '양도 승인'
    case 'CANCELED':
      return '양도 거부'
    default:
      return '양도 요청'
  }
}

type InboxItem = {
  transferId?: number
  senderId: number
  senderName: string
  type?: 'FAMILY' | 'OTHERS' | string | number
  transferType?: 'FAMILY' | 'OTHERS' | string | number
  createdAt: string
  status: string | number
  reservationNumber: string
  fname: string
  posterFile: string
  fcltynm: string
  ticketPrice: number
  performanceDate: string
  selectedTicketCount: number
}

const TransferTicketPage: React.FC = () => {
  const navigate = useNavigate()
  const { data: me } = useTransferor({ enabled: true })
  const { data: myTickets } = useTransferTicketsQuery()
  const {
    data: inbox,
    isLoading: inboxLoading,
    isError: inboxError,
  } = useWatchTransferQuery({ userId: me?.userId, includeCanceled: true })

  const respondFamily = useRespondFamilyTransfer()
  const respondOthers = useRespondOthersTransfer()

  const [pendingId, setPendingId] = useState<number | null>(null)
  const [hidden, setHidden] = useState<Set<string>>(new Set())

  useEffect(() => {
    const onDone = (ev: Event) => {
      const num = (ev as CustomEvent<string>).detail
      setHidden((prev) => new Set(prev).add(num))
    }
    window.addEventListener(TRANSFER_DONE_EVENT, onDone as EventListener)
    return () => window.removeEventListener(TRANSFER_DONE_EVENT, onDone as EventListener)
  }, [])

  const visibleTickets = useMemo(() => {
    const list = myTickets ?? []
    return list.filter((t) => t.rawStatus === 'CONFIRMED' && !hidden.has(t.reservationNumber))
  }, [myTickets, hidden])

  if (visibleTickets.length === 0) {
    return (
      <div className={`${styles.card} ${styles.empty}`}>
        <div className={styles.emptyIcon} aria-hidden />
        <h3 className={styles.emptyTitle}>예매 내역이 없습니다</h3>
        <p className={styles.emptyDesc}>양도 가능한 티켓 내역이 없습니다.</p>
        <button className={styles.primaryBtn} onClick={() => navigate('/')}>티켓 예매하기</button>
      </div>
    )
  }

  const handleTransfer = (reservationNumber: string) => {
    navigate(`/mypage/ticket/transfer/${encodeURIComponent(reservationNumber)}`)
  }

  const handleRespond = useCallback(
    async (item: InboxItem, decision: 'ACCEPTED' | 'REJECTED') => {
      const transferId = (item as any).transferId as number | undefined
      const tType = toType((item as any).type ?? (item as any).transferType)
      if (!transferId || pendingId) return

      if (decision === 'ACCEPTED') {
        setPendingId(transferId)
        const unitPrice = Number(item.ticketPrice) || 0
        const count = Number(item.selectedTicketCount) || 0
        const totalPrice = unitPrice * count
        navigate('/payment/transfer', {
          state: {
            transferId,
            senderId: item.senderId,
            transferStatus: 'ACCEPTED' as const,
            relation: tType,
            title: item.fname,
            datetime: item.performanceDate,
            location: item.fcltynm,
            ticket: count,
            price: unitPrice,
            totalPrice,
            posterFile: item.posterFile,
            reservationNumber: item.reservationNumber,
          },
        })
        return
      }

      try {
        setPendingId(transferId)
        const minimal = { transferId, senderId: item.senderId, transferStatus: 'REJECTED' as const }
        if (tType === 'FAMILY') await respondFamily.mutateAsync(minimal)
        else await respondOthers.mutateAsync(minimal)
        alert('양도 요청을 거절했어요.')
      } catch (e: any) {
        alert(e?.message ?? '요청 처리 중 오류가 발생했어요.')
      } finally {
        setPendingId(null)
      }
    },
    [navigate, pendingId, respondFamily, respondOthers],
  )

  const inboxItems: InboxItem[] = Array.isArray(inbox) ? (inbox as any).filter(Boolean) : []
  const hasInbox = !inboxLoading && !inboxError && inboxItems.length > 0

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>티켓 양도</h2>

      {/* 수신함 */}
      <div className={styles.receivedSection}>
        {hasInbox && (
          <>
            <div className={styles.receivedList}>
              {inboxItems.map((it, idx) => {
                const rel = toRelationLabel((it as any).type ?? (it as any).transferType)
                const normalizedStatus = normalizeServerStatus(it.status)
                const uiStatus = toUiStatusLabel(normalizedStatus)
                const isBusy = pendingId != null && pendingId === (it as any).transferId

                return (
                  <AfterTransferTicket
                    key={`${(it as any).transferId ?? `${it.senderId}-${it.createdAt}`}-${idx}`}
                    title={it.fname}
                    date={fmtDate(it.performanceDate)}
                    time={fmtTime(it.performanceDate)}
                    relation={rel}
                    status={normalizedStatus}
                    statusLabel={uiStatus}
                    posterUrl={it.posterFile}
                    price={it.ticketPrice}
                    count={it.selectedTicketCount}
                    onAccept={() => handleRespond(it, 'ACCEPTED')}
                    onReject={() => handleRespond(it, 'REJECTED')}
                    acceptDisabled={isBusy}
                    rejectDisabled={isBusy}
                  />
                )
              })}
            </div>
            <hr className={styles.sectionDivider} />
          </>
        )}
      </div>

      {/* 내가 가진 티켓 */}
      <div className={styles.list}>
        {visibleTickets.map((t) => (
          <BeforeTransferTicket key={t.reservationNumber} item={t} onTransfer={handleTransfer} />
        ))}
      </div>
    </div>
  )
}

export default TransferTicketPage
