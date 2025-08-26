// src/shared/api/booking/BookingApi.ts
import { api } from '@/shared/config/axios'
import type {
  BookingSelect,
  BookingSelectDelivery,
  Booking,
  FestivalDetail,
  BookingDetail,
} from '@/models/booking/bookingTypes'

// ✅ 서버 응답을 안전하게 정규화
type Ok<T>  = { success: true; data: T; message?: string }
type Err    = { success: false; errorCode?: string; errorMessage?: string; message?: string }
type ApiEnvelope<T> = Ok<T> | Err
type ApiResponse<T> = ApiEnvelope<T> | T // 서버가 그냥 T만 줄 수도 있음

function unwrap<T>(payload: ApiResponse<T>): T {
  // 서버가 {success:..., ...} 형태로 주는 경우
  if (payload && typeof payload === 'object' && 'success' in (payload as any)) {
    const p = payload as ApiEnvelope<T>
    if (p.success === true) {
      if ((p as Ok<T>).data !== undefined && (p as Ok<T>).data !== null) return (p as Ok<T>).data
      throw new Error('Empty response data')
    }
    // 실패 케이스는 반드시 throw
    throw new Error(
      (p as Err).errorMessage ||
      (p as Err).message ||
      (p as Err).errorCode ||
      'Request failed'
    )
  }
  // 서버가 그냥 T만 주는 경우
  if (payload === undefined || payload === null) {
    throw new Error('Empty response')
  }
  return payload as T
}

// 1차 상세 (선택한 날짜/매수 기반 기본 정보)
export async function apiGetPhase1Detail(req: BookingSelect): Promise<FestivalDetail> {
  const res = await api.post<ApiResponse<FestivalDetail>>('/booking/detail/phases/1', req)
  return unwrap(res.data) // ✅ 반드시 값 반환 or throw
}

// 2차 상세 (예약번호 등으로 확정 전 상세)
export async function apiGetPhase2Detail(req: Booking): Promise<BookingDetail> {
  const res = await api.post<ApiResponse<BookingDetail>>('/booking/detail/phases/2', req)
  return unwrap(res.data)
}

// 날짜/매수 확정 -> 예약번호 반환
export async function apiSelectDate(req: BookingSelect): Promise<string> {
  const res = await api.post<ApiResponse<string>>('/booking/selectDate', req)
  return unwrap(res.data)
}

// 수령 방법 선택 (QR 또는 PAPER)
export async function apiSelectDelivery(req: BookingSelectDelivery): Promise<null> {
  const res = await api.post<ApiResponse<null>>('/booking/selectDeliveryMethod', req)
  return unwrap(res.data)
}

// 최종 발권 (QR 생성 등)
export async function apiReserveTicket(req: Booking): Promise<null> {
  const res = await api.post<ApiResponse<null>>('/booking/qr', req)
  return unwrap(res.data)
}
