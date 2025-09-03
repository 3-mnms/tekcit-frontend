import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';

import {
  apiRespondFamily,
  apiRespondOthers,
  apiRequestTransfer,
  apiWatchTransfer,
  apiExtractPersonInfo,
} from '@/shared/api/transfer/transferApi';

import {
  fetchTransfereeByEmail,
  fetchTransferor,
  type AssignmentDTO,
} from '@/shared/api/transfer/userApi';

import type {
  UpdateTicketRequest,
  TicketTransferRequest,
  TransferWatchItem,
  TransferOthersResponse,
  ExtractPayload,
  PersonInfo,
} from '@/models/transfer/transferTypes';

/* ===========================
 *  Query Keys
 * =========================== */
export const TRANSFEROR_QK = ['transfer', 'transferor', 'me'] as const;
export const TRANSFER_OUTBOX_QK = ['transfer', 'requests', 'outbox'] as const;
export const TRANSFER_INBOX_QK  = ['transfer', 'requests', 'inbox', 'watch'] as const;

/* ===========================
 *  Users / Accounts
 * =========================== */
export function useSearchTransferee() {
  return useMutation<AssignmentDTO, Error, string>({
    mutationKey: ['transfer', 'transferee', 'search'],
    mutationFn: (email) => fetchTransfereeByEmail(email),
  });
}

export function useTransferor(options?: { enabled?: boolean; staleTime?: number }) {
  return useQuery<AssignmentDTO, Error>({
    queryKey: TRANSFEROR_QK,
    queryFn: fetchTransferor,
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}

export function prefetchTransferor(qc: QueryClient, staleTime = 5 * 60 * 1000) {
  return qc.prefetchQuery({ queryKey: TRANSFEROR_QK, queryFn: fetchTransferor, staleTime });
}

export function ensureTransferor(qc: QueryClient, staleTime = 5 * 60 * 1000) {
  return qc.ensureQueryData({ queryKey: TRANSFEROR_QK, queryFn: fetchTransferor, staleTime });
}

export function useTransferQueryClient() {
  return useQueryClient();
}

/* ===========================
 *  Requests / Inbox-Outbox
 * =========================== */
export function useRequestTransfer() {
  const qc = useQueryClient();
  return useMutation<void, Error, TicketTransferRequest>({
    mutationKey: ['transfer', 'request'],
    mutationFn: (body) => apiRequestTransfer(body),
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: TRANSFER_OUTBOX_QK });
      qc.invalidateQueries({ queryKey: TRANSFER_INBOX_QK });
    },
  });
}

export function useWatchTransferQuery(opts?: { userId?: number; includeCanceled?: boolean }) {
  return useQuery<TransferWatchItem[], Error>({
    queryKey: [ ...TRANSFER_INBOX_QK, opts?.userId ?? 'me', !!opts?.includeCanceled ],
    queryFn: () => apiWatchTransfer(opts?.userId, opts?.includeCanceled),
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

/* ===========================
 *  Accept / Reject (공용)
 * =========================== */
// 가족: 수락/거절(transferStatus에 따라 모두 처리)
export function useRespondFamilyTransfer() {
  const qc = useQueryClient();
  return useMutation<void, Error, UpdateTicketRequest>({
    mutationKey: ['transfer', 'respond', 'family'],
    mutationFn: (body) => apiRespondFamily(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSFER_INBOX_QK });
      qc.invalidateQueries({ queryKey: TRANSFER_OUTBOX_QK });
    },
  });
}

// 지인: 수락/거절(transferStatus에 따라 모두 처리)
export function useRespondOthersTransfer() {
  const qc = useQueryClient();
  return useMutation<TransferOthersResponse, Error, UpdateTicketRequest>({
    mutationKey: ['transfer', 'respond', 'others'],
    mutationFn: (body) => apiRespondOthers(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSFER_INBOX_QK });
      qc.invalidateQueries({ queryKey: TRANSFER_OUTBOX_QK });
    },
  });
}

/* ========== (옵션) 거절 전용 헬퍼 훅 ========== */
// 필요하면 이렇게 별도 훅으로도 쉽게 호출 가능
export function useRejectFamilyTransfer() {
  const mutate = useRespondFamilyTransfer();
  return {
    ...mutate,
    reject: (base: Omit<UpdateTicketRequest, 'transferStatus' | 'deliveryMethod' | 'address'>) =>
      mutate.mutate({ ...base, transferStatus: 'REJECTED', deliveryMethod: null, address: null }),
  };
}

export function useRejectOthersTransfer() {
  const mutate = useRespondOthersTransfer();
  return {
    ...mutate,
    reject: (base: Omit<UpdateTicketRequest, 'transferStatus' | 'deliveryMethod' | 'address'>) =>
      mutate.mutate({ ...base, transferStatus: 'REJECTED', deliveryMethod: null, address: null }),
  };
}

/* ===========================
 *  OCR (가족관계증명서)
 * =========================== */
/** OCR → 인물 배열(PersonInfo[]) */
export function useExtractPersonInfo() {
  return useMutation<PersonInfo[], Error, ExtractPayload>({
    mutationKey: ['transfer', 'extract', 'people'],
    mutationFn: async (payload) => {
      return await apiExtractPersonInfo(payload);
    },
  });
}

/** OCR 결과의 유효성만 boolean으로 알려주는 훅 */
export function useVerifyFamilyCert() {
  return useMutation<{ success: boolean; message?: string }, Error, ExtractPayload>({
    mutationKey: ['transfer', 'extract', 'verify'],
    mutationFn: async (payload) => {
      const people = await apiExtractPersonInfo(payload);
      const ok = Array.isArray(people) && people.length > 0;
      return { success: ok };
    },
  });
}
