// ✅ 예매 상세 조회 API 유틸 (안전 언래핑 + 디버그 로그 포함)
import { postWithUserId } from '@/shared/api/payment/payment'

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
    sellerId: number
  }
  message: string
}

export async function fetchBookingDetail(
  req: BookingDetailRequest
): Promise<BookingDetailResponse> {
  try {
    const raw = await postWithUserId('/booking/detail/phases/2', req)
    const res: BookingDetailResponse = (raw?.data?.success !== undefined) ? raw.data : raw

    console.log('[PHASE2][RES]', res) // 주석: 서버 응답 전체 로깅

    // 주석: 서버가 200이어도 success=false일 수 있으니 체크
    if (!res.success) {
      throw new Error(res.message || 'phase2 success=false')
    }

    return res
  } catch (e: any) {
    // 주석: 에러 상세(경로 중복, 헤더 누락, CORS 등) 파악용
    console.error('[PHASE2][ERR]', {
      status: e?.response?.status,
      url: (e?.config?.baseURL || '') + (e?.config?.url || ''),
      reqBody: req,
      resData: e?.response?.data,
      headers: e?.config?.headers,
    })
    throw e
  }
}
