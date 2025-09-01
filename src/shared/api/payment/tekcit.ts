// src/shared/api/payment/tekcit.ts
import { api } from '@/shared/config/axios'
import { useAuthStore } from '@/shared/storage/useAuthStore'
import type { AxiosRequestConfig } from 'axios'

/* 주석: "양의 정수" 문자열만 통과시키는 가드 멍 */
const asNumericString = (v: unknown): string | null => {
  const s = String(v ?? '').trim()
  if (!/^\d+$/.test(s)) return null
  const n = Number(s)
  return Number.isFinite(n) && n > 0 ? String(n) : null
}

/* 주석: base64url → JSON 파싱 (패딩/문자 교정 포함) 멍 */
const parseJwtPayload = (token: string | null): any | null => {
  if (!token) return null
  try {
    const part = token.split('.')[1] ?? ''
    const safe = part.replace(/-/g, '+').replace(/_/g, '/')
    const padded = safe + '='.repeat((4 - (safe.length % 4)) % 4)
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

/* 주석: sessionStorage의 zustand persist 스냅샷에서 accessToken 복구 멍 */
const getAccessTokenFromPersist = (): string | null => {
  try {
    const raw = sessionStorage.getItem('auth')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const state = parsed?.state ?? parsed
    return typeof state?.accessToken === 'string' ? state.accessToken : null
  } catch {
    return null
  }
}

/* 주석: X-User-Id 헤더용 유저ID 추출(모의값 없이) 멍 */
export function getUserIdForHeader(): string {
  // 1) Zustand store 최우선 멍
  try {
    const u: any = useAuthStore.getState()?.user
    const cands = [u?.userId, u?.id, u?.memberId, u?.accountId, u?.profile?.userId, u?.profile?.id]
    for (const c of cands) {
      const s = asNumericString(c)
      if (s) return s
    }
  } catch {}

  // 2) accessToken 확보 → JWT 파싱 멍
  const token =
    useAuthStore.getState()?.accessToken ||
    getAccessTokenFromPersist() ||
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken')

  const payload = parseJwtPayload(token)
  if (payload) {
    const cands = [payload?.userId, payload?.id, payload?.memberId, payload?.accountId, payload?.uid, payload?.sub, payload?.sid]
    for (const c of cands) {
      const s = asNumericString(c)
      if (s) return s
    }
  }

  // 3) 레거시 키 멍
  try {
    const legacyKeys = ['userId', 'memberId', 'id']
    for (const k of legacyKeys) {
      const s = asNumericString(localStorage.getItem(k))
      if (s) return s
    }
  } catch {}

  // 4) 실패 시 명확한 에러 멍
  const err: any = new Error('[tekcit] NO_USER_ID: 로그인은 되었지만 userId를 찾지 못했습니다.')
  err.code = 'NO_USER_ID'
  console.error(
    '[tekcit] NO_USER_ID: X-User-Id가 숫자 문자열이어야 합니다. ' +
      'Zustand(user.userId) / sessionStorage(auth.persist) / JWT(userId,id,uid,sub 등) 구조를 점검하세요.'
  )
  throw err
}

/* 주석: 서버 응답이 {code,data} 또는 바로 DTO인 경우 모두 커버 멍 */
const unwrapLikeSuccess = <T>(raw: any): T => {
  // 주석: AxiosResponse 를 받았을 때 res.data → { code, data } 패턴 고려 멍
  if (raw && typeof raw === 'object') {
    if ('data' in raw && raw.data && typeof raw.data === 'object' && 'data' in raw.data) return raw.data.data as T
    if ('data' in raw) return raw.data as T
  }
  return raw as T
}

/* 주석: 공통 GET 래퍼 — X-User-Id 자동 부착 + res.data 반환 멍 */
async function getWithUserId<T = any>(url: string, config: AxiosRequestConfig = {}): Promise<T> {
  const userId = getUserIdForHeader()
  const res = await api.get(url, {
    ...config,
    headers: { ...(config.headers || {}), 'X-User-Id': userId },
  })
  return unwrapLikeSuccess<T>(res)
}

/* 주석: 공통 POST 래퍼 — X-User-Id 자동 부착 + res.data 반환 멍 */
async function postWithUserId<T = any>(url: string, body: any, config: AxiosRequestConfig = {}): Promise<T> {
  const userId = getUserIdForHeader()
  const res = await api.post(url, body, {
    ...config,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json', // 주석: 명시 멍
      ...(config.headers || {}),
      'X-User-Id': userId,
    },
  })
  return unwrapLikeSuccess<T>(res)
}

/** 주석: DTO 타입들 멍 */
export type TekcitPaymentRequestDTO = {
  paymentId: string
  bookingId: string
  festivalId?: string
  paymentRequestType: 'GENERAL_PAYMENT_REQUESTED' | 'POINT_PAYMENT_REQUESTED' | 'POINT_CHARGE_REQUESTED'
  sellerId?: number
  amount: number
  currency?: 'KRW'
  payMethod: 'CARD' | 'POINT'
}

export type TekcitAccountDTO = {
  availableBalance: number
  updatedAt: string
}

/* 주석: 지갑결제(비번검증+차감) DTO — 백엔드 PayByTekcitPayDTO 에 맞춰 선언 멍 */
export type PayByTekcitPayDTO = {
  amount: number // 주석: Long
  paymentId: string // 주석: String
  password: number // 주석: Long(6자리 PIN)
  // 주석: 백엔드 DTO에 다른 필드가 있으면 여기에 추가(예: festivalId, sellerId 등) 멍
}

/* ───────────────────────── API 함수들 ───────────────────────── */

/* 주석: 잔액 조회 — GET /api/tekcitpay 멍 */
export async function getTekcitBalance(): Promise<number> {
  // 주석: 서버 응답 DTO는 availableBalance 포함 멍
  const dto = await getWithUserId<{ availableBalance: number; updatedAt?: string }>('/tekcitpay')
  return dto.availableBalance
}

/* 주석: 계좌 생성 — POST /api/tekcitpay/create-account 멍 */
export async function createTekcitAccount(password: string | number) {
  // 주석: 컨트롤러가 @RequestBody Long 을 기대 → 숫자 값 하나만 전송 멍
  return postWithUserId('/tekcitpay/create-account', Number(password))
}

/* 주석: 지갑 결제(비번검증+차감) — POST /api/tekcitpay 멍 */
export async function payByTekcitPay(params: {
  amount: number
  paymentId: string
  password: string | number
}) {
  // 주석: 서버 PayByTekcitPayDTO 에 맞춰 숫자 변환 멍
  const body: PayByTekcitPayDTO = {
    amount: Number(params.amount),
    paymentId: params.paymentId,
    password: Number(params.password),
  }
  return postWithUserId('/tekcitpay', body)
}

/* 주석: (선택) 이름만 검증 함수로 쓰고 싶으면 payByTekcitPay 래핑 멍 */
export async function verifyTekcitPassword(params: { amount: number; paymentId: string; password: string }) {
  // 주석: 의미상 “검증 후 결제 진행”과 동일 엔드포인트이므로 /tekcitpay 로 보냄 멍
  return payByTekcitPay(params)
}

/* 주석: 결제 요청 — POINT 결제 멍 (결제 오케스트레이션 라우트) */
export async function requestTekcitPayment(params: {
  paymentId: string
  bookingId: string
  festivalId?: string
  sellerId: number
  amount: number
}) {
  const payload: TekcitPaymentRequestDTO = {
    paymentId: params.paymentId,
    bookingId: params.bookingId,
    festivalId: params.festivalId,
    paymentRequestType: 'POINT_PAYMENT_REQUESTED',
    sellerId: params.sellerId,
    amount: params.amount,
    currency: 'KRW',
    payMethod: 'POINT',
  }
  return postWithUserId('/payments/request', payload)
}

/* 주석: 결제 완료 확인 — POST /api/payments/complete/{paymentId} 멍 */
export async function confirmTekcitPayment(paymentId: string) {
  return postWithUserId(`/payments/complete/${encodeURIComponent(paymentId)}`, {})
}

/* 주석: 환불 요청 — POST /api/payments/refund/{paymentId} 멍 */
export async function refundTekcitPayment(paymentId: string) {
  return postWithUserId(`/payments/refund/${encodeURIComponent(paymentId)}`, {})
}

/* ─────────────────────── 로컬 히스토리 유틸 ─────────────────────── */

export type TekcitHistoryItem = {
  id: string
  type: 'charge' | 'refund'
  amount: number
  createdAt: string
}

const TEKCIT_HIS_KEY = 'tekcit.history'

export async function getTekcitHistory(): Promise<TekcitHistoryItem[]> {
  return JSON.parse(localStorage.getItem(TEKCIT_HIS_KEY) ?? '[]')
}

function writeTekcitHistory(list: TekcitHistoryItem[]) {
  localStorage.setItem(TEKCIT_HIS_KEY, JSON.stringify(list))
}

/* 주석: 로컬 충전 기록 추가 멍 */
export async function chargeTekcitLocal(amount: number, txId?: string): Promise<void> {
  if (!Number.isFinite(amount) || amount <= 0) return
  const item: TekcitHistoryItem = {
    id: txId ?? String(Date.now()),
    type: 'charge',
    amount,
    createdAt: new Date().toISOString(),
  }
  writeTekcitHistory([item, ...(await getTekcitHistory())])
}

/* 주석: 로컬 환불 기록 추가 멍 */
export async function refundTekcitLocal(amount: number): Promise<void> {
  if (!Number.isFinite(amount) || amount <= 0) return
  const item: TekcitHistoryItem = {
    id: String(Date.now()),
    type: 'refund',
    amount: -amount,
    createdAt: new Date().toISOString(),
  }
  writeTekcitHistory([item, ...(await getTekcitHistory())])
}
