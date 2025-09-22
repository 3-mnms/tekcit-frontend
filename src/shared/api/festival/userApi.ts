// src/shared/api/user/userApi.ts
import { api } from '@/shared/config/axios';

type ApiEnvelope<T> = { success: boolean; data: T; message?: string } | T;

export type CheckAgeDTO = { age: number };

export async function checkUserAge(): Promise<number> {
  const { data } = await api.get<ApiEnvelope<CheckAgeDTO>>('/users/checkAge');
  const dto: CheckAgeDTO =
    data && typeof data === 'object' && 'success' in (data as any)
      ? ((data as any).data as CheckAgeDTO)
      : (data as CheckAgeDTO);

  if (!dto || typeof dto.age !== 'number') {
    throw new Error('Invalid age response');
  }
  return dto.age;
}
