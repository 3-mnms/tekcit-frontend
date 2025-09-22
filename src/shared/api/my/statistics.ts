// src/shared/api/my/statistics.ts
import { api } from '@/shared/config/axios';

export type StatisticsQrCodeResponseDTO = {
  festivalId: string;
  performanceDate: string;
  availableNOP: number;      
  checkedInCount: number; 
};

type SuccessEnvelope<T> = { success: true; data: T; message?: string };
type ApiResponse<T> = SuccessEnvelope<T> | T;

const unwrap = <T,>(res: ApiResponse<T>): T =>
  (res && typeof res === 'object' && 'success' in (res as any))
    ? (res as SuccessEnvelope<T>).data
    : (res as T);

function toLocalDateTimeParam(input: string): string {
  let s = input.trim();
  s = s.replace(/Z$/, '');     
  s = s.replace(/([+-]\d{2}:\d{2})$/, ''); 
  s = s.replace(/\.\d+$/, '');       
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) s += ':00';
  return s;
}

export async function getEnterStatistics(
  festivalId: string,
  performanceDateISO: string
): Promise<StatisticsQrCodeResponseDTO> {
  const performanceDate = toLocalDateTimeParam(performanceDateISO);
  const { data } = await api.get(`/statistics/enter/${festivalId}`, {
    params: { performanceDate },
  });
  return unwrap<StatisticsQrCodeResponseDTO>(data);
}
