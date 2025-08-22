import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  BookingSelect,
  BookingSelectDelivery,
  Booking,
  FestivalDetail,
  BookingDetail,
} from '@/models/booking/BookingTypes';
import {
  apiGetPhase1Detail,
  apiGetPhase2Detail,
  apiSelectDate,
  apiSelectDelivery,
  apiReserveTicket,
} from '@/shared/api/booking/BookingApi';

// Phase 1: festivalId + performanceDate + selectedTicketCount(보통 0)
export function usePhase1Detail(req: BookingSelect) {
  return useQuery({
    queryKey: ['booking', 'phase1', req.festivalId, req.performanceDate, req.selectedTicketCount ?? 0],
    queryFn: async (): Promise<FestivalDetail> => {
      const res = await apiGetPhase1Detail(req);
      return res.data;
    },
    enabled: Boolean(req?.festivalId && req?.performanceDate),
  });
}

// Phase 2: reservationNumber 기반 상세
export function usePhase2Detail(req: Booking) {
  return useQuery({
    queryKey: ['booking', 'phase2', req.festivalId, req.reservationNumber],
    queryFn: async (): Promise<BookingDetail> => {
      const res = await apiGetPhase2Detail(req);
      return res.data;
    },
    enabled: Boolean(req?.festivalId && req?.reservationNumber),
  });
}

// selectDate -> reservationNumber 반환
export function useSelectDate() {
  return useMutation({
    mutationFn: (req: BookingSelect) => apiSelectDate(req),
  });
}

// 수령방법 선택 (reservationNumber 사용)
export function useSelectDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: BookingSelectDelivery) => apiSelectDelivery(req),
    onSuccess: () => {
      // 수령방법 선택 후 Phase2 정보가 바뀔 수 있으면 갱신
      qc.invalidateQueries({ queryKey: ['booking', 'phase2'] });
    },
  });
}

// 3차 가예매 생성 (결제 직전)
export function useReserveTicket() {
  return useMutation({
    mutationFn: (req: Booking) => apiReserveTicket(req),
  });
}
