import { api } from '@/shared/config/axios';
import type { AssignmentDTO, ApiEnvelope } from '@/models/transfer/userType';

function unwrap<T>(payload: ApiEnvelope<T>): T {
  if (payload && typeof payload === 'object' && 'success' in (payload as any)) {
    const p = payload as any;
    if (p.success === true) return p.data as T;
    throw new Error(p.message || p.errorCode || 'API error');
  }
  if ((payload as any)?.data !== undefined) return (payload as any).data as T;
  return payload as T;
}

/** 양수자(받는 사람) 정보 조회: GET /api/users/transferee?email=... */
export async function fetchTransfereeByEmail(email: string): Promise<AssignmentDTO> {
  const { data } = await api.get('/users/transferee', { params: { email } });
  console.log(data);
  return unwrap<AssignmentDTO>(data as any);
}

/** (옵션) 현재 양도자 정보 조회: GET /api/users/transferor */
export async function fetchTransferor(): Promise<AssignmentDTO> {
  const { data } = await api.get('/users/transferor');
  return unwrap<AssignmentDTO>(data as any);
}
