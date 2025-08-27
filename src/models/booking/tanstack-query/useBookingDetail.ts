// src/models/booking/tanstack-query/useBookingDetail.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  BookingSelect,
  BookingSelectDelivery,
  Booking,
  FestivalDetail,
  BookingDetail,
} from '@/models/booking/bookingTypes'
import {
  apiGetPhase1Detail,
  apiGetPhase2Detail,
  apiSelectDate,
  apiSelectDelivery,
  apiReserveTicket,
  type IssueQrRequest, // ✅ 발권 요청 타입
} from '@/shared/api/booking/bookingApi' // ✅ 경로/케이스 통일

// Phase 1
export function usePhase1Detail(req: BookingSelect) {
  return useQuery<FestivalDetail>({
    queryKey: ['booking', 'phase1', req.festivalId, req.performanceDate, req.selectedTicketCount ?? 0],
    queryFn: () => apiGetPhase1Detail(req),
    enabled: !!req?.festivalId && !!req?.performanceDate,
    retry: false,
    refetchOnWindowFocus: false,
  })
}

// Phase 2
export function usePhase2Detail(req: Booking) {
  return useQuery<BookingDetail>({
    queryKey: ['booking', 'phase2', req.festivalId, req.reservationNumber],
    queryFn: () => apiGetPhase2Detail(req),
    enabled: !!req?.festivalId && !!req?.reservationNumber,
    retry: false,
    refetchOnWindowFocus: false,
  })
}

// selectDate
export function useSelectDate() {
  return useMutation({
    mutationFn: (req: BookingSelect) => apiSelectDate(req),
  })
}

// 수령방법 선택 (UI->BE 매핑은 컴포넌트에서 처리하여 BookingSelectDelivery로 전달)
export function useSelectDelivery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: BookingSelectDelivery) => apiSelectDelivery(req),
    onSuccess: () => {
      // phase2 전체 갱신
      qc.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === 'booking' &&
          q.queryKey[1] === 'phase2',
      })
    },
  })
}

// 가예매 생성(최종 발권 요청)
// apiReserveTicket은 IssueQrRequest를 기대
export function useReserveTicket() {
  return useMutation({
    mutationFn: (req: IssueQrRequest) => apiReserveTicket(req),
  })
}
