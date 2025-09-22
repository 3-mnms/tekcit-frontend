// bookingId 준비되면 자동으로 sellerId를 가져오고, 로딩/에러 상태를 관리

import { useQuery } from '@tanstack/react-query'
import { createPaymentSession, type CreateSessionResponse } from '@/shared/api/payment/paymentSession'

/** bookingId → sellerId 쿼리 훅 */
export function usePaymentSession(bookingId?: string) {
  return useQuery<CreateSessionResponse>({
    queryKey: ['payment', 'session', bookingId],
    queryFn: async () => {
      if (!bookingId) throw new Error('bookingId is required')
      return createPaymentSession(bookingId)
    },
    enabled: !!bookingId,   // bookingId가 있어야 호출됨
    staleTime: 60_000,      // 1분 캐싱
    retry: 1,               // 실패 시 1회만 재시도
  })
}
