// src/models/transfer/tanstack-query/userTransfer.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

import {
  apiExtractPersonInfo,
  apiUpdateFamilyTransfer,
} from '@/shared/api/transfer/transferApi';
import {
  fetchTransfereeByEmail,
  fetchTransferor,
  type AssignmentDTO,
} from '@/shared/api/transfer/userApi';

import type {
  ExtractPayload,
  ExtractResponse,
  UpdateTicketRequest,
} from '@/models/transfer/transferTypes';

/* ===========================
 *  Query Keys
 * =========================== */
export const TRANSFEROR_QK = ['transfer', 'transferor', 'me'] as const;

/* ===========================
 *  OCR / Update (가족 양도)
 * =========================== */

/** 가족관계증명서 OCR 인증 */
export function useExtractPersonInfo() {
  return useMutation<ExtractResponse, Error, ExtractPayload>({
    mutationKey: ['transfer', 'extract'],
    mutationFn: (payload) => apiExtractPersonInfo(payload),
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
    mutationFn: (email: string) => fetchTransfereeByEmail(email),
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

/** 페이지 입장 전/직후 미리 받아오기 */
export function prefetchTransferor(qc: QueryClient, staleTime = 5 * 60 * 1000) {
  return qc.prefetchQuery({
    queryKey: TRANSFEROR_QK,
    queryFn: fetchTransferor,
    staleTime,
  });
}

/** 필요 시 즉시 확보(있으면 재사용, 없으면 fetch) */
export function ensureTransferor(qc: QueryClient, staleTime = 5 * 60 * 1000) {
  return qc.ensureQueryData({
    queryKey: TRANSFEROR_QK,
    queryFn: fetchTransferor,
    staleTime,
  });
}

/** 훅 내부에서 QueryClient 쓰고 싶을 때 */
export function useTransferQueryClient() {
  return useQueryClient();
}
