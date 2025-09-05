// src/shared/api/payment/payments.ts
// 목적: 결제/양도 관련 API 클라이언트
// 변경점:
// 1) requestTekcitPay가 서버로부터 paymentId를 반환받지 않음(void)  // 클라가 기존 paymentId를 전달
// 2) PayByTekcitPayDTO에 paymentId 필수 포함
// 3) GET /tekcitpay(잔액 조회) 유틸 추가
// 4) bookingId ↔ paymentId 매핑 유틸 추가 (세션스토리지)

// --------------------------------------------------------
// 공통 import
import { api } from '@/shared/config/axios'
import { z } from 'zod'

// --------------------------------------------------------
// 타입 정의
// 결제 요청 단계 상태(요청 시점 한정)
export type PaymentOrderStatus =
  | 'GENERAL_PAYMENT_REQUESTED'
  | 'POINT_PAYMENT_REQUESTED'
  | 'POINT_CHARGE_REQUESTED'

// 결제 전체 상태(enum 매핑)
export type PaymentStatus =
  | 'GENERAL_PAYMENT_REQUESTED'
  | 'GENERAL_PAYMENT_READY'
  | 'GENERAL_PAYMENT_PAID'
  | 'GENERAL_PAYMENT_FAILED'
  | 'GENERAL_PAYMENT_CANCELLED'
  | 'GENERAL_PAYMENT_REJECTED'
  | 'POINT_PAYMENT_REQUESTED'
  | 'POINT_PAYMENT_READY'
  | 'POINT_PAYMENT_PAID'
  | 'POINT_PAYMENT_FAILED'
  | 'POINT_PAYMENT_CANCELLED'
  | 'POINT_PAYMENT_REJECTED'
  | 'POINT_CHARGE_REQUESTED'
  | 'POINT_CHARGE_READY'
  | 'POINT_CHARGE_PAID'
  | 'POINT_CHARGE_FAILED'
  | 'POINT_CHARGE_CANCELLED'
  | 'POINT_CHARGE_REJECTED'

// 결제수단
export type PayMethodType = 'CARD' | 'POINT_PAYMENT' | 'POINT_CHARGE'

// --------------------------------------------------------
// DTO 정의

// 공용 결제요청 DTO(필요 시 유지)
export interface PaymentRequestDTO {
  paymentId: string
  bookingId?: string | null
  festivalId?: string | null
  paymentRequestType: PaymentOrderStatus
  buyerId?: number
  sellerId?: number | null
  amount: number
  currency?: 'KRW'
  payMethod: PayMethodType
}

// 양도 결제 요청 DTO
export interface requestTransferPaymentDTO {
  sellerId: number
  paymentId: string         // 기존 결제의 paymentId 사용
  bookingId: string
  totalAmount: number
  commission: number
}

// 🔧 수정: 클라이언트가 기존 paymentId를 넣어 호출
export interface PayByTekcitPayDTO {
  amount: number
  paymentId: string         // 필수: 기존 결제의 paymentId
  password: string
}

// --------------------------------------------------------
// API 함수들

// 🔧 수정: 서버가 paymentId를 새로 반환하지 않으므로 void
export async function requestTekcitPay(
  dto: PayByTekcitPayDTO,
  userId: number,
): Promise<void> {
  // 헤더로 X-User-Id 전달(인증/컨텍스트용)
  await api.post('/tekcitpay', dto, {
    headers: { 'X-User-Id': String(userId) },
  })
}

// 양도 결제 생성(transfer)
export async function requestTransferPayment(
  dto: requestTransferPaymentDTO,
  userId: number,
): Promise<void> {
  await api.post('/tekcitpay/transfer', dto, {
    headers: { 'X-User-Id': String(userId) },
  })
}

// ✅ 스웨거 캡처 기반: GET /api/tekcitpay (잔액 조회)
// 응답 예시: { success: true, data: { availableBalance: number, updatedAt: string }, message: string }
export interface TekcitPayBalance {
  availableBalance: number
  updatedAt: string
}

// 잔액 조회: 필요 시 결제 전 확인용으로 사용
export async function getTekcitPayBalance(userId: number): Promise<TekcitPayBalance> {
  const { data } = await api.get('/tekcitpay', {
    headers: { 'X-User-Id': String(userId) },
  })
  // 서버 표준 응답 래핑({ success, data, message }) 가정
  return (data?.data ?? { availableBalance: 0, updatedAt: '' }) as TekcitPayBalance
}

// --------------------------------------------------------
// bookingId ↔ paymentId 매핑 유틸 (세션스토리지)

// 세션 스토리지 키
const STORAGE_KEY_PAYMENT_MAP = 'tekcit:paymentIdByBookingId'

// 스키마: { [bookingId: string]: string(paymentId) }
const PaymentIdMapSchema = z.record(
  z.string(),                       // bookingId
  z.string().uuid().or(z.string())  // paymentId (UUID 우선, 문자열도 임시 허용)
)

type PaymentIdMap = z.infer<typeof PaymentIdMapSchema>

/** 내부 유틸: 세션 스토리지에서 맵 로드 */
function loadPaymentIdMap(): PaymentIdMap {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_PAYMENT_MAP)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    const safe = PaymentIdMapSchema.parse(parsed)
    return safe
  } catch {
    // 손상 시 초기화
    return {}
  }
}

/** 내부 유틸: 세션 스토리지에 맵 저장 */
function savePaymentIdMap(map: PaymentIdMap) {
  sessionStorage.setItem(STORAGE_KEY_PAYMENT_MAP, JSON.stringify(map))
}

/** bookingId에 대응되는 paymentId 저장 */
export function setPaymentIdForBooking(bookingId: string, paymentId: string) {
  const map = loadPaymentIdMap()
  map[bookingId] = paymentId
  savePaymentIdMap(map)
}

/** bookingId로 paymentId 조회 (없으면 null) */
export function getPaymentIdByBookingId(bookingId: string): string | null {
  const map = loadPaymentIdMap()
  return map[bookingId] ?? null
}

/** bookingId 매핑 제거 */
export function removePaymentIdForBooking(bookingId: string) {
  const map = loadPaymentIdMap()
  if (bookingId in map) {
    delete map[bookingId]
    savePaymentIdMap(map)
  }
}
