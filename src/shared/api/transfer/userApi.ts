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
  return unwrap<AssignmentDTO>(data as any);
}

/** (옵션) 현재 양도자 정보 조회: GET /api/users/transferor */
export async function fetchTransferor(): Promise<AssignmentDTO> {
  const { data } = await api.get('/users/transferor');
  return unwrap<AssignmentDTO>(data as any);
}

export function normalizeRrn7(input?: string | number | null): string {
  const raw = (input ?? '').toString().trim()
  if (!raw) return ''

  // 1) 숫자만 추출
  const digits = raw.replace(/\D/g, '')

  // 2) 7자리 이상이면 앞 6 + 7번째 한 자리로 'YYMMDD-#'
  if (digits.length >= 7) {
    return `${digits.slice(0, 6)}-${digits.charAt(6)}`
  }

  // 3) 이미 7자리 포맷(하이픈 유무)인 경우 커버
  const m = raw.match(/^(\d{6})-?(\d)$/)
  if (m) return `${m[1]}-${m[2]}`

  // 그 외는 부족/불명확 → 빈 문자열
  return ''
}