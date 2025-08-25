// src/shared/api/booking/BookingApi.ts
import { api } from '@/shared/api/axios' // ✅ 공용 axios 인스턴스만 사용
import type {
  BookingSelect,
  BookingSelectDelivery,
  Booking,
  FestivalDetail,
  BookingDetail,
} from '@/models/booking/BookingTypes'

// 서버 공통 응답 형태 가정: { data: T, message?: string, ... }
type ApiResponse<T> = { data: T; message?: string }

// 1차 상세 (선택한 날짜/매수 기반 기본 정보)
export async function apiGetPhase1Detail(req: BookingSelect) {
  const { data } = await api.post<ApiResponse<FestivalDetail>>('/booking/detail/phases/1', req)
  return data.data
}

// 2차 상세 (예약번호 등으로 확정 전 상세)
export async function apiGetPhase2Detail(req: Booking) {
  const { data } = await api.post<ApiResponse<BookingDetail>>('/booking/detail/phases/2', req)
  return data.data
}

// 날짜/매수 확정 -> 예약번호 반환
export async function apiSelectDate(req: BookingSelect) {
  const { data } = await api.post<ApiResponse<string>>('/booking/selectDate', req)
  return data.data // reservationNumber
}

// 수령 방법 선택 (QR 또는 PAPER)
export async function apiSelectDelivery(req: BookingSelectDelivery) {
  const { data } = await api.post<ApiResponse<null>>('/booking/selectDeliveryMethod', req)
  return data.data
}

// 최종 발권 (QR 생성 등)
export async function apiReserveTicket(req: Booking) {
  const { data } = await api.post<ApiResponse<null>>('/booking/qr', req)
  return data.data
}
