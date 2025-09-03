// src/models/ticket/tanstack-query/useTickets.ts
import { useQuery } from '@tanstack/react-query';
import { getTickets, getTicketDetail, getTransferTickets } from '@/shared/api/my/history/ticket';
import type { TicketResponseDTO, TicketListItem, ReservationStatus, TransferListItem } from '@/models/my/ticket/ticketTypes';
import { format } from 'date-fns';

const statusToLabel = (s: ReservationStatus): string => {
    switch (s) {
        case 'CONFIRMED':
            return '예매 완료';
        case 'CANCELED':
            return '취소 완료';
        case 'TEMP_RESERVED':
            return '가예매';
        case 'PAYMENT_IN_PROGRESS':
            return '결제 중';
        default:
            return s;
    }
};

const toDotYMD = (yyyyMmDd: string) => {
    // yyyy-MM-dd -> yyyy.MM.dd
    return yyyyMmDd.replaceAll('-', '.');
};

const toYMDHM = (localDateTime: string) => {
    // '2025-10-18T17:00:00' 같은 형태 가정
    // date-fns format으로 안전 포맷
    const d = new Date(localDateTime);
    if (isNaN(d.getTime())) return localDateTime; // 서버 포맷이 다르면 원문 노출
    return `${format(d, 'yyyy.MM.dd HH:mm')}`;
};

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
});

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
});

export const useTicketsQuery = () => {
    return useQuery({
        queryKey: ['tickets', 'me'],
        queryFn: getTickets,
        staleTime: 60_000,
        select: (list: TicketResponseDTO[]) => list.map(mapToListItem),
    });
};

export const useTicketDetailQuery = (reservationNumber?: string) => {
  return useQuery({
    queryKey: ['ticket', 'detail', reservationNumber],
    queryFn: () => getTicketDetail(reservationNumber!),
    enabled: !!reservationNumber,
    staleTime: 60_000,
  });
};

export const useTransferTicketsQuery = () => {
    return useQuery({
        queryKey: ['tickets', 'me'],
        queryFn: getTransferTickets,
        staleTime: 60_000,
        select: (list: TicketResponseDTO[]) => list.map(mapToTransferListItem),
    });
};
