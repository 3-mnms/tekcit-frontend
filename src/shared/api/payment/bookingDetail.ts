import { api } from '@/shared/config/axios'                           // 주석: 공통 axios 인스턴스
import { getUserIdSafely } from '@/models/payment/utils/paymentUtils' // 주석: userId 조회 유틸 (store → JWT → localStorage)

export type BookingDetailRequest = {
  festivalId: string            // 주석: 서버 스펙과 키 일치
  performanceDate: string       // 주석: ISO 문자열 권장 ("2025-09-15T18:00:00")
  reservationNumber: string     // 주석: bookingId를 그대로 매핑
}

export type BookingDetailResponse = {
  success: boolean
  data: {
    festivalName: string
    ticketPrice: number
    posterFile: string
    performanceDate: string
    ticketCount: number
    sellerId: number            // 주석: 서버가 seller_id로 줄 수도 있어 런타임 보정함
  }
  message: string
}

export async function fetchBookingDetail(
  req: BookingDetailRequest
): Promise<BookingDetailResponse> {
  // 주석: 헤더 준비 (Content-Type 고정, X-User-Id는 있으면만 부착)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  let hadUserId = false // 주석: 디버그용 플래그

  try {
    const uid = getUserIdSafely()
    headers['X-User-Id'] = String(uid)
    hadUserId = true
  } catch {
    // 주석: 비로그인/토큰 문제 등으로 userId가 없을 때 → 헤더 없이 보냄
  }

  try {
    const axiosRes = await api.post('/booking/detail/phases/2', req, { headers })
    const raw = axiosRes.data

    const res: BookingDetailResponse = (raw?.data?.success !== undefined) ? raw.data : raw

    if (!res?.success) {
      throw new Error(res?.message || 'phase2 success=false')
    }

    if (!res.data?.sellerId && (res as any)?.data?.seller_id) {
      res.data.sellerId = Number((res as any).data.seller_id)
    }

    if (typeof res.data?.sellerId !== 'number' || !Number.isFinite(res.data.sellerId)) {
      throw new Error('sellerId 누락 또는 형식 오류')
    }

    return res
  } catch (e: any) {
    const status = e?.response?.status as number | undefined

    console.error('[PHASE2][ERR]', {
      status,
      url: (e?.config?.baseURL || '') + (e?.config?.url || ''),
      reqBody: req,
      resData: e?.response?.data,
      headers: e?.config?.headers,
      hadUserId,                          // 주석: X-User-Id를 붙였는지 여부
      sentHeaders: headers,               // 주석: 우리가 세팅한 헤더(실제 전송값 참고)
    })

    if (status === 401 || status === 403) {
      const err: any = new Error('LOGIN_REQUIRED') // 주석: 호출부에서 code로 분기 → 로그인 유도
      err.code = 'LOGIN_REQUIRED'
      throw err
    }

    throw e
  }
}
