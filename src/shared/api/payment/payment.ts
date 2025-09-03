import { api } from '@/shared/config/axios'
import { useAuthStore } from '@/shared/storage/useAuthStore'

/** ✅ X-User-Id 값을 안전하게 추출 (store → JWT → localStorage → throw) */
export function getUserIdForHeader(): string {
  const toUserId = (v: unknown): string | null => {
    const n = Number(v) // 주석: "123" → 123, null/undefined → NaN
    return Number.isFinite(n) && n > 0 ? String(n) : null
  }

  // 1) Zustand store에서 가져오기 (문자/숫자 모두 허용)
  try {
    const uid = (useAuthStore.getState()?.user as any)?.userId
    const s = toUserId(uid)
    if (s) return s
  } catch {
    // 주석: store 구조가 달라도 무시하고 다음 단계로
  }

  // 2) JWT 파싱 (Bearer 접두/URL-safe Base64/패딩 대응)
  try {
    // 주석: SSR 안전 가드
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('accessToken') || ''
      const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw
      if (token) {
        // 주석: URL-safe(-,_) 처리 + 패딩 맞추기
        const part = token.split('.')[1] ?? ''
        const safe = part.replace(/-/g, '+').replace(/_/g, '/')
        const padded = safe + '='.repeat((4 - (safe.length % 4)) % 4)
        const payload = JSON.parse(atob(padded))
        const cand = payload?.userId ?? payload?.sub ?? payload?.uid
        const s = toUserId(cand)
        if (s) return s
      }
    }
  } catch {
    // 주석: atob/JSON.parse 실패 시 다음 단계로
  }

  // 3) localStorage fallback
  try {
    if (typeof window !== 'undefined') {
      const legacy = localStorage.getItem('userId')
      const s = toUserId(legacy)
      if (s) return s
    }
  } catch {
    // 주석: 접근 불가/권한 오류 등은 다음 단계로
  }

  // 4) 모두 실패 → 명시 에러 코드로 throw
  const err: any = new Error('NO_USER_ID') // 호출부에서 분기하기 쉬움
  err.code = 'NO_USER_ID'
  throw err
}

/** ✅ GET 호출 시 X-User-Id 헤더 자동 부착 */
export async function getWithUserId<T = any>(url: string, config: any = {}) {
  const userId = getUserIdForHeader()

  const res = await api.get<T>(url, {
    ...config,
    headers: {
      ...(config.headers || {}),
      'X-User-Id': userId,            // 주석: 항상 안전하게 userId 부착 멍
    },
  })

  return res.data
}

/** ✅ POST 호출 시 X-User-Id 헤더 자동 부착 (+ baseURL 중복 방지) */
export async function postWithUserId<T = any>(url: string, body: any) {
  console.log(`#!@#! url : ${url}}, body : ${body}`);
  

  const res = await api.post<T>(url, body, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // 주석: Axios는 항상 res.data를 가짐 → res.data로 고정 반환
  return res.data
}