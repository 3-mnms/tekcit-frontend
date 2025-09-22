// src/shared/api/payment/admin.ts
import { api } from '@/shared/config/axios'

export type PayMethodType = 'POINT_PAYMENT' | 'CARD' | 'ACCOUNT' | string;

export interface TekcitPayAccountResponseDTO {
  availableBalance: number;
  updatedAt: string; 
}

export interface PaymentOrderDTO {
  paymentId: string;
  amount: number;
  currency: string;
  payMethod: PayMethodType;
  payTime: string;     
  paymentStatus: string;
  transactionType: string; 
  buyerId: number;  
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; 
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

type SuccessResponse<T> = { success: true; data: T };
type ErrorResponse = { success: false; errorCode?: string; errorMessage?: string };
type ApiEnvelope<T> = SuccessResponse<T> | ErrorResponse;

const PATH = {
  totalAmount: '/tekcitpay/admin/total-amount',
  history: '/tekcitpay/admin/history',
} as const;

export async function getAdminTotalAmount(
  headers: { userId?: string; userRole: 'ADMIN' | string },
  signal?: AbortSignal,
): Promise<TekcitPayAccountResponseDTO> {
  const res = await api.get<ApiEnvelope<TekcitPayAccountResponseDTO>>(PATH.totalAmount, {
    headers: {
      'X-User-Role': headers.userRole,
      'X-User-Id': headers.userId ?? '',
    },
    signal,
  });
  if (!res.data.success) throw new Error(res.data.errorMessage ?? '총액 조회 실패');
  return res.data.data;
}

export async function getAdminHistory(
  params: { page: number; size: number; userRole: 'ADMIN' | string },
  signal?: AbortSignal,
): Promise<PageResponse<PaymentOrderDTO>> {
  const res = await api.get<ApiEnvelope<PageResponse<PaymentOrderDTO>>>(PATH.history, {
    params: { page: params.page, size: params.size },
    headers: { 'X-User-Role': params.userRole },
    signal,
  });
  if (!res.data.success) throw new Error(res.data.errorMessage ?? '내역 조회 실패');
  return res.data.data;
}
