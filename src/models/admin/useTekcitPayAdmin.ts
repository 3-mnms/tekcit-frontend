// src/models/payment/tanstack-query/useTekcitPayAdmin.ts
import { useQuery } from '@tanstack/react-query'
import { getAdminTotalAmount, getAdminHistory, type TekcitPayAccountResponseDTO, type PageResponse, type PaymentOrderDTO } from '@/shared/api/admin/managePayment'
import { useAuthStore } from '@/shared/storage/useAuthStore'

export function useAdminTotalAmountQuery() {
  // BE는 X-User-Id 헤더도 받지만, 내부에서 1L 고정 사용 중.
  const userId = String(useAuthStore.getState().user?.id ?? '') // 없으면 빈 문자열
  return useQuery<TekcitPayAccountResponseDTO>({
    queryKey: ['tekcitpay', 'admin', 'total-amount', userId],
    queryFn: ({ signal }) => getAdminTotalAmount({ userId, userRole: 'ADMIN' }, signal),
    staleTime: 60_000,
  })
}

export function useAdminHistoryQuery(page: number, size: number) {
  return useQuery<PageResponse<PaymentOrderDTO>>({
    queryKey: ['tekcitpay', 'admin', 'history', page, size],
    queryFn: ({ signal }) => getAdminHistory({ page, size, userRole: 'ADMIN' }, signal),
    // keepPreviousData: true,
  })
}
