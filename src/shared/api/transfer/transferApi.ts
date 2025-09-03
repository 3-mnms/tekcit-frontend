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
import { FRtoBEString } from '@/models/transfer/transferTypes';

const PATH = {
  extract: '/transfer/extract',
  request: '/transfer/request',
  watch: '/transfer/watch',
  acceptanceFamily: '/transfer/acceptance/family',
  acceptanceOthers: '/transfer/acceptance/others', // 거절도 동일 엔드포인트
};

const stripNullish = <T extends object>(obj: T): Partial<T> => {
  const out: any = {};
  for (const [k, v] of Object.entries(obj)) if (v !== null && v !== undefined) out[k] = v;
  return out;
};

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'success' in (payload as any)) {
    const p = payload as ApiOk<T> | ApiErr;
    if ((p as ApiOk<T>).success === true) {
      const ok = p as ApiOk<T>;
      return (ok.data as T) ?? (undefined as unknown as T);
    }
    const err = p as ApiErr;
    throw new Error(err.errorMessage || err.message || err.errorCode || 'API error');
  }
  return payload as T;
}

/* ============== OCR ============== */
export async function apiExtractPersonInfo(payload: ExtractPayload): Promise<ExtractResponse> {
  const form = new FormData();
  form.append('file', payload.file);
  form.append('targetInfo', JSON.stringify(payload.targetInfo));

  const res = await api.post<ApiEnvelope<ExtractResponse> | ExtractResponse>(PATH.extract, form, {
    validateStatus: () => true,
  });
  if (res.status >= 400) throw new Error(`${res.status} ${(res.data as any)?.message ?? res.statusText}`);
  return unwrap<ExtractResponse>(res.data);
}

/* ============== 요청/조회 ============== */
export async function apiRequestTransfer(body: TicketTransferRequest): Promise<void> {
  const res = await api.post<ApiEnvelope<null> | null>(PATH.request, body, { validateStatus: () => true });
  if (res.status >= 400) throw new Error(`${res.status} ${(res.data as any)?.message ?? res.statusText}`);
  unwrap<null>(res.data ?? null);
}

export async function apiWatchTransfer(
  userId?: number,
  includeCanceled?: boolean
): Promise<TransferWatchItem[]> {
  const candidates = [
    '/transfer/watch',
    '/transfer/requests/watch',
    '/transfer/requests/inbox',
    '/transfer/inbox',
  ];

  const uspBase = new URLSearchParams();
  if (typeof userId === 'number' && Number.isFinite(userId)) {
    uspBase.set('userId', String(userId));
  }
  if (includeCanceled) {
    uspBase.set('includeCanceled', '1');
    uspBase.set('all', '1');
  }

  let lastErr: unknown = null;

  for (const path of candidates) {
    try {
      const usp = new URLSearchParams(uspBase);
      const url = `${path}${usp.toString() ? `?${usp.toString()}` : ''}`;
      const res = await api.get<ApiEnvelope<TransferWatchItem[]> | TransferWatchItem[]>(url, {
        validateStatus: () => true,
      });

      if (res.status === 404) continue;
      if (res.status >= 400) {
        lastErr = new Error(`${res.status} ${(res.data as any)?.message ?? res.statusText}`);
        continue;
      }
      return unwrap<TransferWatchItem[]>(res.data);
    } catch (e) {
      lastErr = e;
      continue;
    }
  }

  if (lastErr) console.warn('[apiWatchTransfer] fallback to empty list due to errors:', lastErr);
  return [];
}

/* ============== 가족 ============== */
/** 가족 응답은 status를 **문자열 enum**으로 전송 */
export async function apiRespondFamily(body: UpdateTicketRequest): Promise<void> {
  const beStatus = FRtoBEString(body.transferStatus); // 'APPROVED' | 'CANCELED' | ...

  const base = stripNullish(body) as any;
  delete base.transferStatus;               // 서버는 transferStatus 대신 status 사용
  const mapped = { ...base, status: beStatus };

  const qs = `?transferId=${encodeURIComponent(body.transferId)}&senderId=${encodeURIComponent(body.senderId)}`;
  const url = `${PATH.acceptanceFamily}${qs}`;

  const res = await api.put(url, mapped, { validateStatus: () => true });

  if (res.status >= 400) {
    // 디버깅 보조
    // eslint-disable-next-line no-console
    console.error('[apiRespondFamily] 4xx/5xx', res.status, res.data, { url, sent: mapped });
    throw new Error(`${res.status} ${(res.data as any)?.message ?? res.statusText}`);
  }
  // 성공(Void)
}

/* ============== 지인(Others) ============== */
/** Others 응답도 status를 **문자열 enum**으로 전송 */
export async function apiRespondOthers(body: UpdateTicketRequest): Promise<TransferOthersResponse> {
  const beStatus = FRtoBEString(body.transferStatus);

  const base = stripNullish(body) as any;
  delete base.transferStatus;
  const mapped = { ...base, status: beStatus };

  const qs = `?transferId=${encodeURIComponent(body.transferId)}&senderId=${encodeURIComponent(body.senderId)}`;
  const url = `${PATH.acceptanceOthers}${qs}`;

  const res = await api.put<ApiEnvelope<TransferOthersResponse> | TransferOthersResponse>(
    url,
    mapped,
    { validateStatus: () => true },
  );

  if (res.status >= 400) {
    // 디버깅 보조
    // eslint-disable-next-line no-console
    console.error('[apiRespondOthers] 4xx/5xx', res.status, res.data, { url, sent: mapped });
    throw new Error(`${res.status} ${(res.data as any)?.message ?? res.statusText}`);
  }

  const data = (res.data && ((res.data as any).data ?? res.data)) as TransferOthersResponse;
  return data;
}
