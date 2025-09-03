// src/shared/api/payment/tekcit.ts
import { api } from '@/shared/config/axios'
import { useAuthStore } from '@/shared/storage/useAuthStore'
import type { AxiosRequestConfig } from 'axios'

/* ───────────────────────── 내부 헬퍼 ───────────────────────── */

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

/* 주석: X-User-Id 헤더용 유저ID 추출 멍 */
export function getUserIdForHeader(): string {
  try {
    const u: any = useAuthStore.getState()?.user
    const cands = [u?.userId, u?.id, u?.memberId, u?.accountId, u?.profile?.userId, u?.profile?.id]
    for (const c of cands) {
      const s = asNumericString(c)
      if (s) return s
    }
  } catch { }

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

  try {
    const legacyKeys = ['userId', 'memberId', 'id']
    for (const k of legacyKeys) {
      const s = asNumericString(localStorage.getItem(k))
      if (s) return s
    }
  } catch { }

  const err: any = new Error('[tekcit] NO_USER_ID: 로그인은 되었지만 userId를 찾지 못했습니다.')
  err.code = 'NO_USER_ID'
  console.error(
    '[tekcit] NO_USER_ID: X-User-Id가 숫자 문자열이어야 합니다. ' +
    'Zustand(user.userId) / sessionStorage(auth.persist) / JWT(userId,id,uid,sub 등) 구조를 점검하세요.'
  )
  throw err
}

/* 주석: 서버 응답 unwrap 멍 */
const unwrapLikeSuccess = <T>(raw: any): T => {
  if (raw && typeof raw === 'object') {
    if ('data' in raw && raw.data && typeof raw.data === 'object' && 'data' in raw.data) return raw.data.data as T
    if ('data' in raw) return raw.data as T
  }
  return raw as T
}

/* 주석: 공통 GET/POST 래퍼 멍 */
async function getWithUserId<T = any>(url: string, config: AxiosRequestConfig = {}): Promise<T> {
  const userId = getUserIdForHeader()
  const res = await api.get(url, {
    ...config,
    headers: { ...(config.headers || {}), 'X-User-Id': userId },
  })
  return unwrapLikeSuccess<T>(res)
}
async function postWithUserId<T = any>(url: string, body: any, config: AxiosRequestConfig = {}): Promise<T> {
  const userId = getUserIdForHeader()
  const res = await api.post(url, body, {
    ...config,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(config.headers || {}),
      'X-User-Id': userId,
    },
  })
  return unwrapLikeSuccess<T>(res)
}

/* ───────────────────────── DTO 타입 ───────────────────────── */
export type TekcitPaymentRequestDTO = {
  paymentId: string
  bookingId: string
  festivalId: string
  paymentRequestType: 'POINT_PAYMENT_REQUESTED'
  sellerId: number
  amount: number
  buyerId: number
  currency: 'KRW'
  payMethod: 'POINT'
}

export type TekcitAccountDTO = {
  availableBalance: number
  updatedAt: string
}

export type PayByTekcitPayDTO = {
  amount: number
  paymentId: string
  password: number
}

/* ───────────────────────── API 함수 ───────────────────────── */

export async function getTekcitBalance(): Promise<number> {
  const dto = await getWithUserId<{ availableBalance: number; updatedAt?: string }>('/tekcitpay')
  return dto.availableBalance
}

// 재시도 로직이 포함된 테킷페이 결제 함수
export async function payByTekcitPay(params: { amount: number; paymentId: string; password: string | number }) {
  const body: PayByTekcitPayDTO = {
    amount: Number(params.amount),
    paymentId: params.paymentId,
    password: Number(params.password),
  }

  // 최대 10회 재시도 (약 15초 총 대기)
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      console.log(`💳 테킷페이 결제 시도 ${attempt}/10 - paymentId: ${params.paymentId}`)
      return await postWithUserId('/tekcitpay', body)
    } catch (error: any) {
      const errorCode = error?.response?.data?.errorCode
      
      // NOT_FOUND_PAYMENT_ID 에러이고 마지막 시도가 아니면 재시도
      if (errorCode === 'NOT_FOUND_PAYMENT_ID' && attempt < 10) {
        const delay = attempt * 500 // 500ms, 1000ms, 1500ms, ... 최대 4.5초
        console.log(`⏳ PaymentOrder 대기 중... (${attempt}/10) - ${delay}ms 후 재시도`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      // 다른 에러이거나 마지막 시도면 그대로 throw
      console.error(`❌ 테킷페이 결제 실패 (${attempt}/10):`, error?.response?.data)
      throw error
    }
  }
}

export async function verifyTekcitPassword(params: { amount: number; paymentId: string; password: string }) {
  return payByTekcitPay(params)
}

// camelCase로 수정된 결제 요청 함수
export async function requestTekcitPayment(params: {
  paymentId: string
  bookingId: string
  festivalId: string
  sellerId: number
  buyerId?: number
  amount: number
}) {
  // camelCase로 전송 (서버 DTO와 일치)
  const payload = {
    paymentId: params.paymentId,
    bookingId: params.bookingId,
    festivalId: params.festivalId,
    sellerId: params.sellerId,
    buyerId: params.buyerId,
    amount: params.amount,
    currency: 'KRW',
    payMethod: 'POINT_PAYMENT',  // PayMethodType enum 값
    paymentRequestType: 'POINT_PAYMENT_REQUESTED'
  }

  // null/undefined 키 제거
  const clean: Record<string, any> = {}
  for (const [k, v] of Object.entries(payload)) {
    if (v !== undefined && v !== null) clean[k] = v
  }

  console.log('📤 결제 요청 데이터:', clean)
  return postWithUserId('/payments/request', clean)
}

export async function confirmTekcitPayment(paymentId: string) {
  return postWithUserId(`/payments/complete/${paymentId}`, {})
}

/* ─────────────────────── 로컬 히스토리 ─────────────────────── */
export type TekcitHistoryItem = {
  id: string
  type: 'charge'
  amount: number
  createdAt: string
}
const TEKCIT_HIS_KEY = 'tekcit.history'
export async function getTekcitHistory(): Promise<TekcitHistoryItem[]> {
  return JSON.parse(localStorage.getItem(TEKCIT_HIS_KEY) ?? '[]')
}
