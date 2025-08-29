// src/shared/api/my/history/payment.ts
import { api } from '@/shared/config/axios';

export type PaymentOrderDTO = {
  paymentId: string;
  amount: number;
  currency: string;
  payMethod: 'CARD' | 'BANK_TRANSFER' | 'KAKAO_PAY' | 'POINT'; // enum 매핑
  payTime: string; // ISO (LocalDateTime)
};

export async function getPaymentOrdersByFestivalId(festivalId: string) {
  const { data } = await api.get(`/api/payments/${festivalId}`);
  // { success, data, message } 형태일 가능성 → envelope 처리
  return (data?.data ?? data) as PaymentOrderDTO[];
}
