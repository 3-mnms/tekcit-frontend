// src/models/ticket/tanstack-query/useTickets.ts
import { useQuery } from '@tanstack/react-query'
import { getTickets, getTicketDetail, getTransferTickets } from '@/shared/api/my/history/ticket'
import type { TicketResponseDTO, TicketListItem, ReservationStatus, TransferListItem } from '@/models/my/ticket/ticketTypes'
import { format } from 'date-fns'

const statusToLabel = (s: ReservationStatus): string => {
  switch (s) {
    case 'CONFIRMED': return '예매 완료'
    case 'CANCELED': return '취소 완료'
    case 'TEMP_RESERVED': return '가예매'
    case 'PAYMENT_IN_PROGRESS': return '결제 중'
    default: return s
  }
}

const toDotYMD = (yyyyMmDd: string) => yyyyMmDd.replaceAll('-', '.')
const toYMDHM = (localDateTime: string) => {
  const d = new Date(localDateTime)
  if (Number.isNaN(d.getTime())) return localDateTime
  return format(d, 'yyyy.MM.dd HH:mm')
}

const mapToListItem = (t: TicketResponseDTO): TicketListItem => ({
  id: t.id,
  reservationNumber: t.reservationNumber,
  number: t.reservationNumber,
  title: t.fname,
  date: toDotYMD(t.reservationDate),
  dateTime: toYMDHM(t.performanceDate),
  count: t.selectedTicketCount,
  statusLabel: statusToLabel(t.reservationStatus),
  rawStatus: t.reservationStatus,
  posterFile: t.posterFile,
  festivalId: t.festivalId,
})

const mapToTransferListItem = (t: TicketResponseDTO): TransferListItem => ({
  id: t.id,
  reservationNumber: t.reservationNumber,
  number: t.reservationNumber,
  title: t.fname,
  date: toDotYMD(t.reservationDate),
  dateTime: toYMDHM(t.performanceDate),
  count: t.selectedTicketCount,
  statusLabel: statusToLabel(t.reservationStatus),
  rawStatus: t.reservationStatus,
  posterFile: t.posterFile,
  festivalId: t.festivalId,
})

export const useTicketsQuery = (
  userId: string,
  opts?: { status?: string; startDate?: Date | null; endDate?: Date | null }
) => {
  const status = opts?.status ?? 'ALL'
  const startISO = opts?.startDate ? opts.startDate.toISOString().slice(0, 10) : null
  const endISO   = opts?.endDate ? opts.endDate.toISOString().slice(0, 10) : null

  return useQuery({
    queryKey: ['my', 'tickets', 'history', userId, status, startISO, endISO],
    queryFn: () => getTickets(), // 서버 필터 연동 시: () => getTickets({ status, startISO, endISO })
    select: (list: TicketResponseDTO[]) => list.map(mapToListItem),
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    staleTime: 0,
  })
}

export const useTicketDetailQuery = (userId: string, reservationNumber?: string) => {
  return useQuery({
    queryKey: ['my', 'ticket', 'detail', userId, reservationNumber],
    queryFn: () => getTicketDetail(reservationNumber!), // reservationNumber 보장 시점에만 호출
    enabled: !!reservationNumber,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    staleTime: 0,
  })
}

export const useTransferTicketsQuery = (userId: string) => {
  return useQuery({
    queryKey: ['my', 'tickets', 'transfer', userId],
    queryFn: getTransferTickets,
    select: (list: TicketResponseDTO[]) => list.map(mapToTransferListItem),
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    staleTime: 0,
  })
}
