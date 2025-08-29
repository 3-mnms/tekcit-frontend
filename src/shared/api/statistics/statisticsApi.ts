// src/api/statistics/statisticsApi.ts
import { api } from '@/shared/config/axios';
import type { StatisticsUser } from '@/models/statistics/statisticsTypes';

// 서버가 envelope( success/data )로 줄 수도, 바로 DTO를 줄 수도 있어 둘 다 대응
type Ok<T>  = { success: true; data: T; message?: string };
type Err    = { success: false; errorCode?: string; errorMessage?: string; message?: string };
type ApiEnvelope<T> = Ok<T> | Err;
type ApiResponse<T> = ApiEnvelope<T> | T;

function unwrap<T>(payload: ApiResponse<T>): T {
  if (payload && typeof payload === 'object' && 'success' in (payload as any)) {
    const p = payload as ApiEnvelope<T>;
    if (p.success) {
      if ((p as Ok<T>).data !== undefined && (p as Ok<T>).data !== null) return (p as Ok<T>).data;
      throw new Error('Empty response data');
    }
    const e = p as Err;
    throw new Error(e.errorMessage || e.message || e.errorCode || 'Request failed');
  }
  return payload as T;
}

/** [GET] /api/statistics/users/{festivalId} */
export async function fetchFestivalUserStatistics(festivalId: string): Promise<StatisticsUser> {
  if (!festivalId) throw new Error('festivalId is required');
  const res = await api.get(`/statistics/users/${festivalId}`);
  const dto = unwrap<StatisticsUser>(res.data);

  // 안전 가드
  return {
    totalPopulation: dto.totalPopulation ?? 0,
    genderCount: dto.genderCount ?? {},
    genderPercentage: dto.genderPercentage ?? {},
    ageGroupCount: dto.ageGroupCount ?? {},
    ageGroupPercentage: dto.ageGroupPercentage ?? {},
  };
}
