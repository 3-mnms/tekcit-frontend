// src/shared/api/my/history/payment.ts
import { api } from '@/shared/config/axios';

export type PaymentOrderDTO = {
  paymentId: string;
  amount: number;
  currency: string;
  payMethod: 'CARD' | 'BANK_TRANSFER' | 'KAKAO_PAY' | 'POINT'; // enum 매핑
  payTime: string; 
  paymentStatus: string;
};

export async function getPaymentOrdersByBookingId(bookingId: string) {
  const { data } = await api.get(`/payments/${bookingId}`);
  return (data?.data ?? data) as PaymentOrderDTO[];
}
