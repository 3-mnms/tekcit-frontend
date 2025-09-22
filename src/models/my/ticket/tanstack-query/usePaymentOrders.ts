// src/models/payment/tanstack-query/usePaymentOrders.ts
import { useQuery } from '@tanstack/react-query';
import { getPaymentOrdersByBookingId } from '@/shared/api/my/history/payment';

export const usePaymentOrdersQuery = (bookingId?: string) => {
  return useQuery({
    queryKey: ['payments', bookingId],
    queryFn: () => getPaymentOrdersByBookingId(bookingId!),
    enabled: !!bookingId,
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,  
    refetchOnReconnect: false,
  });
};