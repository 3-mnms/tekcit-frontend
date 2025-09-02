import { api } from '@/shared/config/axios';
import type {
  ExtractPayload,
  ExtractResponse,
  UpdateTicketRequest,
  TicketTransferRequest,
  TransferWatchItem,
  TransferOthersResponse,
  ApiEnvelope,
  ApiOk,
  ApiErr,
} from '@/models/transfer/transferTypes';

const PATH = {
  extract: '/transfer/extract',
  request: '/transfer/request',
  watch: '/transfer/watch',
  // ✅ 수락/거절(가족/지인)
  acceptanceFamily: '/transfer/acceptance/family',
  acceptanceOthers: '/transfer/acceptance/others',
};

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'success' in (payload as any)) {
    const p = payload as ApiOk<T> | ApiErr;
    if ((p as ApiOk<T>).success === true) {
      const ok = p as ApiOk<T>;
      if (ok.data !== undefined) return ok.data;
      // data가 없는 SuccessResponse<Void>도 있으니 T가 void일 수 있음
      return undefined as unknown as T;
    }
    const err = p as ApiErr;
    throw new Error(err.errorMessage || err.message || err.errorCode || 'API error');
  }
  return payload as T;
}

/** 가족관계증명서 OCR 인증 (multipart/form-data) */
export async function apiExtractPersonInfo(payload: ExtractPayload): Promise<ExtractResponse> {
  const form = new FormData();
  form.append('file', payload.file);
  form.append('targetInfo', JSON.stringify(payload.targetInfo));

  const res = await api.post<ApiEnvelope<ExtractResponse> | ExtractResponse>(
    PATH.extract,
    form,
    { validateStatus: () => true },
  );

  if (res.status === 404) throw new Error('404 Not Found: /transfer/extract');
  if (res.status >= 400) throw new Error(`${res.status} ${(res.data as any)?.message ?? res.statusText}`);
  return unwrap<ExtractResponse>(res.data);
}

/** 양도 요청 */
export async function apiRequestTransfer(body: TicketTransferRequest): Promise<void> {
  const res = await api.post<ApiEnvelope<null> | null>(PATH.request, body, { validateStatus: () => true });
  if (res.status === 404) throw new Error('404 Not Found: /transfer/request');
  if (res.status >= 400) throw new Error(`${res.status} ${(res.data as any)?.message ?? res.statusText}`);
  unwrap<null>(res.data ?? null);
}

/** 양도 요청 조회 */
export async function apiWatchTransfer(): Promise<TransferWatchItem[]> {
  const res = await api.get<ApiEnvelope<TransferWatchItem[]> | TransferWatchItem[]>(PATH.watch, {
    validateStatus: () => true,
  });
  if (res.status >= 400) throw new Error(`${res.status} ${(res.data as any)?.message ?? res.statusText}`);
  return unwrap<TransferWatchItem[]>(res.data);
}

/** ✅ 가족/지인 응답(수락/거절 공통) - 백엔드 UpdateTicketRequestDTO 사용 */
// 가족: 성공시 Void
export async function apiRespondFamily(body: UpdateTicketRequest): Promise<void> {
  const res = await api.put<ApiEnvelope<null> | null>(PATH.acceptanceFamily, body, { validateStatus: () => true });
  if (res.status === 404) throw new Error('404 Not Found: /transfer/acceptance/family');
  if (res.status >= 400) throw new Error(`${res.status} ${(res.data as any)?.message ?? res.statusText}`);
  unwrap<null>(res.data ?? null);
}

// 지인: 성공시 TransferOthersResponseDTO
export async function apiRespondOthers(body: UpdateTicketRequest): Promise<TransferOthersResponse> {
  const res = await api.put<ApiEnvelope<TransferOthersResponse> | TransferOthersResponse>(
    PATH.acceptanceOthers,
    body,
    { validateStatus: () => true },
  );
  if (res.status === 404) throw new Error('404 Not Found: /transfer/acceptance/others');
  if (res.status >= 400) throw new Error(`${res.status} ${(res.data as any)?.message ?? res.statusText}`);
  return unwrap<TransferOthersResponse>(res.data);
}
