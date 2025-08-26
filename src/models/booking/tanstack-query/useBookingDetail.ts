// ✅ useBookingDetail.ts (수정본)
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
} from '@/shared/api/booking/bookingApi'

// Phase 1
export function usePhase1Detail(req: BookingSelect) {
  return useQuery<FestivalDetail>({
    queryKey: ['booking', 'phase1', req.festivalId, req.performanceDate, req.selectedTicketCount ?? 0],
    queryFn: () => apiGetPhase1Detail(req),  // ✅ res.data 말고 res 자체를 반환
    enabled: !!req?.festivalId && !!req?.performanceDate,
    retry: false,
    refetchOnWindowFocus: false,
  })
}

// Phase 2
export function usePhase2Detail(req: Booking) {
  return useQuery<BookingDetail>({
    queryKey: ['booking', 'phase2', req.festivalId, req.reservationNumber],
    queryFn: () => apiGetPhase2Detail(req),  // ✅ 동일
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

// 수령방법 선택
export function useSelectDelivery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: BookingSelectDelivery) => apiSelectDelivery(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['booking', 'phase2'] })
    },
  })
}

// 가예매 생성
export function useReserveTicket() {
  return useMutation({
    mutationFn: (req: Booking) => apiReserveTicket(req),
  })
}
