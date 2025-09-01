import { api } from '@/shared/config/axios';

export type TekcitPayAccountResponseDTO = {
  availableBalance: number;
  updatedAt: string; 
};

export async function getTekcitPayAccount() {
  const { data } = await api.get('/tekcitpay'); // 헤더(Authorization, X-User-Id)는 인터셉터로
  return (data?.data ?? data) as TekcitPayAccountResponseDTO;
}
