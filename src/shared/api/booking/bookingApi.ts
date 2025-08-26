// src/shared/api/booking/BookingApi.ts
import { api } from '@/shared/config/axios'
import type {
  BookingSelect,
  BookingSelectDelivery,
  Booking,
  FestivalDetail,
  BookingDetail,
} from '@/models/booking/bookingTypes'

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
    // 실패는 반드시 throw
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

export async function apiGetPhase1Detail(req: BookingSelect): Promise<FestivalDetail> {
  const res = await api.post<ApiResponse<FestivalDetail>>('/booking/detail/phases/1', req)
  return unwrap(res.data)
}

export async function apiGetPhase2Detail(req: Booking): Promise<BookingDetail> {
  const res = await api.post<ApiResponse<BookingDetail>>('/booking/detail/phases/2', req)
  return unwrap(res.data)
}

export async function apiSelectDate(req: BookingSelect): Promise<string> {
  const res = await api.post<ApiResponse<string>>('/booking/selectDate', req)
  return unwrap(res.data)
}

export async function apiSelectDelivery(req: BookingSelectDelivery): Promise<null> {
  const res = await api.post<ApiResponse<null>>('/booking/selectDeliveryMethod', req)
  return unwrap(res.data)
}

export type IssueQrRequest = {
  festivalId: string
  reservationNumber: string            // ex) 'TE3167730'
  performanceDate: string              // 'YYYY-MM-DDTHH:mm:ss'
  ticketCount: number                  // 선택 매수
  deliveryMethod: 'QR' | 'PAPER'       // 수령 방법
}

function assertIssueQr(req: IssueQrRequest) {
  const miss: string[] = []
  if (!req.festivalId) miss.push('festivalId')
  if (!req.reservationNumber) miss.push('reservationNumber')
  if (!req.performanceDate) miss.push('performanceDate')
  if (!(Number.isFinite(req.ticketCount) && req.ticketCount > 0)) miss.push('ticketCount')
  if (!req.deliveryMethod) miss.push('deliveryMethod')
  if (miss.length) throw new Error(`/booking/qr missing fields: ${miss.join(', ')}`)
}

export async function apiReserveTicket(req: IssueQrRequest): Promise<null> {
  assertIssueQr(req)

  const body = {
    ...req,
    // 호환용 필드 (서버에 따라 reservationId를 기대할 수 있음)
    reservationId: req.reservationNumber,
  }

  const idem = (globalThis.crypto?.randomUUID?.() ?? String(Date.now()))

  try {
    const res = await api.post<ApiResponse<null>>('/booking/qr', body, {
      headers: {
        'Idempotency-Key': idem,
        'Content-Type': 'application/json',
      },
    })
    return unwrap(res.data)
  } catch (e: any) {
    // 4xx/5xx 원인 디버깅
    console.error('[QR 4xx/5xx] status=', e?.response?.status)
    console.error('[QR 4xx/5xx] request body=', body)
    console.error('[QR 4xx/5xx] response body=', e?.response?.data ?? e?.message)
    throw e
  }
}
