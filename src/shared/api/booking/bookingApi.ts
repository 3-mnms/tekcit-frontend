// src/shared/api/booking/bookingApi.ts
import { api } from '@/shared/config/axios'
import type {
  BookingSelect,
  BookingSelectDelivery,
  Booking,
  FestivalDetail,
  BookingDetail,
} from '@/models/booking/bookingTypes'

/** 공통 응답 타입 */
type Ok<T>  = { success: true; data: T; message?: string }
type Err    = { success: false; errorCode?: string; errorMessage?: string; message?: string }
type ApiEnvelope<T> = Ok<T> | Err
type ApiResponse<T> = ApiEnvelope<T> | T

/** 바디 있는 응답용(unwrapped data 반환) */
export function unwrap<T>(payload: ApiResponse<T>): T {
  if (payload && typeof payload === 'object' && 'success' in (payload as any)) {
    const p = payload as ApiEnvelope<T>
    if (p.success === true) return (p as any).data as T // data null 허용
    const e = p as Err
    throw new Error(e.errorMessage || e.message || e.errorCode || 'Request failed')
  }
  // envelope가 아니면 원본 반환
  return payload as T
}

/** 바디 없는 성공 응답용(void) */
export function unwrapVoid(payload: any): void {
  if (payload && typeof payload === 'object' && 'success' in payload) {
    if (payload.success === true) return
    const e = payload as Err
    throw new Error(e.errorMessage || e.message || e.errorCode || 'Request failed')
  }
  // 200 이면서 envelope 아님 → OK
}

/** ===== Phase / Details ===== */

/** 1차 상세 */
export async function apiGetPhase1Detail(req: BookingSelect): Promise<FestivalDetail> {
  const res = await api.post<ApiResponse<FestivalDetail>>('/booking/detail/phases/1', req)
  return unwrap(res.data)
}

/** 2차 상세 */
export async function apiGetPhase2Detail(req: Booking): Promise<BookingDetail> {
  const res = await api.post<ApiResponse<BookingDetail>>('/booking/detail/phases/2', req)
  return unwrap(res.data)
}

/** 날짜/시간 선택 (reservationNumber 발급) */
export async function apiSelectDate(req: BookingSelect): Promise<string> {
  const res = await api.post<ApiResponse<string>>('/booking/selectDate', req)
  return unwrap(res.data) // reservationNumber
}

/** ===== Delivery / Issue ===== */

/** UI → BE 수령방법 매퍼: 'QR' | 'PAPER' → 'MOBILE' | 'PAPER' */
export const mapUiDeliveryToBE = (v: 'QR' | 'PAPER'): 'MOBILE' | 'PAPER' =>
  v === 'QR' ? 'MOBILE' : 'PAPER'

/** 수령 방법/주소 선택 */
export async function apiSelectDelivery(req: BookingSelectDelivery): Promise<void> {
  const res = await api.post('/booking/selectDeliveryMethod', req)
  unwrapVoid(res.data)
}

/** QR 발권 직전(3차) - /booking/qr 는 3필드만! */
export type IssueQrRequest = {
  festivalId: string
  reservationNumber: string            // ex) 'TE3167730'
  performanceDate: string              // 'YYYY-MM-DDTHH:mm:ss' (LocalDateTime)
}

/** 3차 예매 완료(결제 직전) */
export async function apiReserveTicket(req: IssueQrRequest): Promise<void> {
  const idem = (globalThis.crypto?.randomUUID?.() ?? String(Date.now()))
  try {
    const res = await api.post('/booking/qr', {
      festivalId: req.festivalId,
      reservationNumber: req.reservationNumber,
      performanceDate: req.performanceDate,
    }, {
      headers: {
        'Idempotency-Key': idem,
        'Content-Type': 'application/json',
      },
    })
    unwrapVoid(res.data)
  } catch (e: any) {
    console.error('[QR 4xx/5xx] status=', e?.response?.status)
    console.error('[QR 4xx/5xx] request body=', req)
    console.error('[QR 4xx/5xx] response body=', e?.response?.data ?? e?.message)
    throw e
  }
}
