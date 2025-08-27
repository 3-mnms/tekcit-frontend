import { api } from '@/shared/config/axios'
import type {
  BookingSelect,
  BookingSelectDelivery,
  Booking,
  FestivalDetail,
  BookingDetail,
} from '@/models/booking/bookingTypes'

/** 공통 응답 Envelope */
type Ok<T>  = { success: true; data: T; message?: string }
type Err    = { success: false; errorCode?: string; errorMessage?: string; message?: string }
type ApiEnvelope<T> = Ok<T> | Err
type ApiResponse<T> = ApiEnvelope<T> | T

function unwrap<T>(payload: ApiResponse<T>): T {
  if (payload && typeof payload === 'object' && 'success' in (payload as any)) {
    const p = payload as ApiEnvelope<T>
    if (p.success === true) {
      // ✅ data === null/undefined여도 성공으로 간주
      return (p as any).data as T
    }
    throw new Error(
      (p as Err).errorMessage ||
      (p as Err).message ||
      (p as Err).errorCode ||
      'Request failed'
    )
  }
  // success-envelope가 아니라면 원본을 그대로 반환(백엔드가 생바디일 수도)
  if (payload === undefined || payload === null) {
    // 과거 로직은 오류로 처리했지만, 성공 200에 빈 바디인 경우도 허용
    return (null as unknown) as T
  }
  return payload as T
}

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

/** 수령 방법/주소 선택 (MOBILE | PAPER)  */
export async function apiSelectDelivery(req: BookingSelectDelivery): Promise<null> {
  // 주의: req.deliveryMethod 는 'MOBILE' | 'PAPER'
  const res = await api.post<ApiResponse<null>>('/booking/selectDeliveryMethod', req)
  return unwrap(res.data)
}

/** QR 발권 직전(3차) - /booking/qr 는 아래 3필드만! */
export type IssueQrRequest = {
  festivalId: string
  reservationNumber: string            // ex) 'TE3167730'
  performanceDate: string              // 'YYYY-MM-DDTHH:mm:ss' (LocalDateTime)
}

function assertIssueQr(req: IssueQrRequest) {
  const miss: string[] = []
  if (!req.festivalId) miss.push('festivalId')
  if (!req.reservationNumber) miss.push('reservationNumber')
  if (!req.performanceDate) miss.push('performanceDate')
  if (miss.length) throw new Error(`/booking/qr missing fields: ${miss.join(', ')}`)
}

/** 3차 예매 완료(결제 직전) */
export async function apiReserveTicket(req: IssueQrRequest): Promise<null> {
  assertIssueQr(req)

  const body = {
    festivalId: req.festivalId,
    reservationNumber: req.reservationNumber,
    performanceDate: req.performanceDate,
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
    console.error('[QR 4xx/5xx] status=', e?.response?.status)
    console.error('[QR 4xx/5xx] request body=', body)
    console.error('[QR 4xx/5xx] response body=', e?.response?.data ?? e?.message)
    throw e
  }
}

/** UI → BE 수령방법 매퍼: 'QR' | 'PAPER'  →  'MOBILE' | 'PAPER' */
export const mapUiDeliveryToBE = (v: 'QR' | 'PAPER'): 'MOBILE' | 'PAPER' =>
  v === 'QR' ? 'MOBILE' : 'PAPER'
