// src/models/payment/tanstack-query/usePaymentOrders.ts
import { useQuery } from '@tanstack/react-query';
import { getPaymentOrdersByFestivalId, type PaymentOrderDTO } from '@/shared/api/my/history/payment';

export const usePaymentOrdersQuery = (festivalId?: string) => {
  return useQuery({
    queryKey: ['payments', festivalId],
    queryFn: () => getPaymentOrdersByFestivalId(festivalId!),
    enabled: !!festivalId,
    staleTime: 60_000,
  });
};

export const usePaymentOrderByReservationQuery = (festivalId?: string) => {
  return useQuery({
    queryKey: ['payments', festivalId],
    queryFn: () => getPaymentOrdersByFestivalId(festivalId!),
    enabled: !!festivalId,
    staleTime: 60_000,
  });
};