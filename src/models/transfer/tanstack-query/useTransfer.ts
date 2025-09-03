import axiosBase from 'axios';
import { api } from '@/shared/config/axios';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

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
  PersonInfo,
  TicketTransferRequest,
  TransferWatchItem,
  TransferOthersResponse,
  ExtractPayload,
} from '@/models/transfer/transferTypes';

export const TRANSFEROR_QK = ['transfer', 'transferor', 'me'] as const;
export const TRANSFER_OUTBOX_QK = ['transfer', 'requests', 'outbox'] as const;
export const TRANSFER_INBOX_QK  = ['transfer', 'requests', 'inbox', 'watch'] as const;

/* OCR 전용 axios (전역 인터셉터 우회) */
const apiRaw = axiosBase.create({
  baseURL: api.defaults.baseURL,
  withCredentials: (api.defaults as any)?.withCredentials ?? false,
});

/* OCR 응답 정규화 */
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
  if (Array.isArray(raw?.data)) return raw.data as PersonInfo[];
  if (Array.isArray(raw?.result)) return raw.result as PersonInfo[];
  return [];
}

/* OCR 훅 */
export function useExtractPersonInfo() {
  return useMutation<PersonInfo[], Error, ExtractPayload>({
    mutationKey: ['transfer', 'extract', 'people'],
    mutationFn: async ({ file, targetInfo }) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('targetInfo', JSON.stringify(targetInfo));
      const res = await apiRaw.post('/transfer/extract', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        validateStatus: (s) => s >= 200 && s < 300,
        transformResponse: [(data) => data],
      });
      return normalizePeopleResponse(res.data);
    },
  });
}

export function useVerifyFamilyCert() {
  return useMutation<{ success: boolean; message?: string }, Error, ExtractPayload>({
    mutationKey: ['transfer', 'extract', 'verify'],
    mutationFn: async ({ file, targetInfo }) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('targetInfo', JSON.stringify(targetInfo));
      const res = await apiRaw.post('/transfer/extract', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        validateStatus: (s) => s >= 200 && s < 300,
        transformResponse: [(data) => data],
      });

      let body: any = res.data;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { body = {}; }
      }
      const ok =
        body?.success === true ||
        (Array.isArray(body?.data) && body.data.length > 0) ||
        (Array.isArray(body) && body.length > 0);

      return { success: !!ok, message: body?.message };
    },
  });
}

/* 유저 */
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
export function useTransferQueryClient() { return useQueryClient(); }

/* 요청/조회 */
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

/* 수락/거절 */
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
