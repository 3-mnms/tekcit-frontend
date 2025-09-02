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
} from '@/models/transfer/transferTypes';

// ----------------- Query Keys -----------------
export const TRANSFEROR_QK = ['transfer', 'transferor', 'me'] as const;
export const TRANSFER_OUTBOX_QK = ['transfer', 'requests', 'outbox'] as const;
export const TRANSFER_INBOX_QK  = ['transfer', 'requests', 'inbox', 'watch'] as const;

type ExtractParams = { file: File; targetInfo: Record<string, string> };

// ----------------- Raw Axios ------------------
const apiRaw = axiosBase.create({
  baseURL: api.defaults.baseURL,
  withCredentials: (api.defaults as any)?.withCredentials ?? false,
});

// ----------------- OCR ------------------------
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

export function useExtractPersonInfo() {
  return useMutation<PersonInfo[], Error, ExtractParams>({
    mutationFn: async ({ file, targetInfo }) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('targetInfo', JSON.stringify(targetInfo));
      const res = await apiRaw.post('/transfer/extract', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        validateStatus: (s) => s >= 200 && s < 300,
        transformResponse: [(d) => d],
      });
      return normalizePeopleResponse(res.data);
    },
  });
}

// ----------------- 유저 -----------------------
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

// ----------------- 요청/조회 ------------------
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

export function useWatchTransferQuery() {
  return useQuery<TransferWatchItem[], Error>({
    queryKey: TRANSFER_INBOX_QK,
    queryFn: apiWatchTransfer,
    staleTime: 30_000,
  });
}

// ----------------- ✅ 수락/거절 -----------------
/**
 * 가족 양도 응답(수락/거절)
 * - body.transferStatus === 'ACCEPTED' | 'REJECTED'
 */
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

/**
 * 지인 양도 응답(수락/거절)
 * - body.transferStatus === 'ACCEPTED' | 'REJECTED'
 * - 성공 시 결제 단계로 넘길 데이터(TransferOthersResponse) 반환
 */
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
