// src/models/transfer/tanstack-query/useTransfer.ts
import axiosBase from 'axios';
import { api } from '@/shared/config/axios';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

import {
  apiUpdateFamilyTransfer,
} from '@/shared/api/transfer/transferApi';
import {
  fetchTransfereeByEmail,
  fetchTransferor,
  type AssignmentDTO,
} from '@/shared/api/transfer/userApi';

import type {
  UpdateTicketRequest,
  PersonInfo,
} from '@/models/transfer/transferTypes';

/* ===========================
 *  Query Keys
 * =========================== */
export const TRANSFEROR_QK = ['transfer', 'transferor', 'me'] as const;

type ExtractParams = {
  file: File;
  targetInfo: Record<string, string>;
};

/* ===========================
 *  Axios (인터셉터 우회 인스턴스)
 * =========================== */
const apiRaw = axiosBase.create({
  baseURL: api.defaults.baseURL,
  withCredentials: (api.defaults as any)?.withCredentials ?? false,
});

/* ===========================
 *  응답 정규화
 * =========================== */
function normalizePeopleResponse(raw: any): PersonInfo[] {
  try {
    if (typeof raw === 'string') {
      const t = raw.trim();
      if (!t) return [];
      const parsed = JSON.parse(t);
      return normalizePeopleResponse(parsed);
    }
  } catch {
    return [];
  }

  if (!raw) return [];
  if (Array.isArray(raw)) return raw as PersonInfo[];
  if (Array.isArray(raw.data)) return raw.data as PersonInfo[];
  if (Array.isArray(raw.result)) return raw.result as PersonInfo[];
  return [];
}

/* ===========================
 *  OCR / Update (가족 양도)
 * =========================== */

/** 가족관계증명서 OCR 인증 */
export function useExtractPersonInfo() {
  return useMutation<PersonInfo[], Error, ExtractParams>({
    mutationFn: async ({ file, targetInfo }) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('targetInfo', JSON.stringify(targetInfo));

      const res = await apiRaw.post('/transfer/extract', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        validateStatus: (s) => s >= 200 && s < 300,
        transformResponse: [(data) => data], // 전역 transform/인터셉터 무력화
      });

      return normalizePeopleResponse(res.data);
    },
  });
}

export function useVerifyFamilyCert() {
  return useMutation<{ success: boolean; message?: string }, Error, ExtractParams>({
    mutationFn: async ({ file, targetInfo }) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('targetInfo', JSON.stringify(targetInfo));

      // 인터셉터/transform 우회: 빈 바디/문자열도 그대로 받기
      const res = await apiRaw.post('/transfer/extract', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        validateStatus: (s) => s >= 200 && s < 300,
        transformResponse: [(data) => data],
      });

      let body: any = res.data;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { body = {}; }
      }
      return { success: body?.success === true, message: body?.message };
    },
  });
}

/** 가족 간 양도 완료(승인) */
export function useUpdateFamilyTransfer(ticketId?: number | string) {
  return useMutation<void, Error, UpdateTicketRequest>({
    mutationKey: ['transfer', 'update', ticketId],
    mutationFn: (body) => {
      if (ticketId === undefined || ticketId === null) {
        throw new Error('ticketId가 필요합니다.');
      }
      return apiUpdateFamilyTransfer(ticketId, body);
    },
  });
}

/* ===========================
 *  유저(양도자/양수자) 쿼리/뮤테이션
 * =========================== */

/** 양수자 이메일 검색 */
export function useSearchTransferee() {
  return useMutation<AssignmentDTO, Error, string>({
    mutationKey: ['transfer', 'transferee', 'search'],
    mutationFn: (email) => fetchTransfereeByEmail(email),
  });
}

/** 양도자(현재 로그인 사용자) 정보 */
export function useTransferor(options?: { enabled?: boolean; staleTime?: number }) {
  return useQuery<AssignmentDTO, Error>({
    queryKey: TRANSFEROR_QK,
    queryFn: fetchTransferor,
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}

/* ===========================
 *  Prefetch / Ensure Helpers
 * =========================== */

export function prefetchTransferor(qc: QueryClient, staleTime = 5 * 60 * 1000) {
  return qc.prefetchQuery({
    queryKey: TRANSFEROR_QK,
    queryFn: fetchTransferor,
    staleTime,
  });
}

export function ensureTransferor(qc: QueryClient, staleTime = 5 * 60 * 1000) {
  return qc.ensureQueryData({
    queryKey: TRANSFEROR_QK,
    queryFn: fetchTransferor,
    staleTime,
  });
}

export function useTransferQueryClient() {
  return useQueryClient();
}
