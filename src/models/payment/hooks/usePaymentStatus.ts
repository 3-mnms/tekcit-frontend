// src/shared/hooks/usePaymentStatus.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/config/axios'

export const usePaymentStatus = (paymentId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ['payment-status', paymentId],
    queryFn: async () => {
      const response = await api.get(`/payments/${paymentId}/status`)
      return response.data
    },
    enabled: enabled && !!paymentId, // paymentId가 있을 때만 실행
    refetchInterval: 2000, // 2초마다 체크
    refetchIntervalInBackground: false,
    retry: 3, // 3번까지 재시도
    staleTime: 0, // 항상 최신 데이터 요청
  })
}