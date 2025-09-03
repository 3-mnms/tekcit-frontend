// src/models/payment/tanstack-query/usePaymentOrders.ts
import { useQuery } from '@tanstack/react-query';
import { getPaymentOrdersByBookingId, type PaymentOrderDTO } from '@/shared/api/my/history/payment';

export const usePaymentOrdersQuery = (bookingId?: string) => {
  return useQuery({
    queryKey: ['payments', bookingId],
    queryFn: () => getPaymentOrdersByBookingId(bookingId!),
    enabled: !!bookingId,
    staleTime: 60_000,
  });
};

export const usePaymentOrderByReservationQuery = (bookingId?: string) => {
  return useQuery({
    queryKey: ['payments', bookingId],
    queryFn: () => getPaymentOrdersByBookingId(bookingId!),
    enabled: !!bookingId,
    staleTime: 60_000,
  });
};