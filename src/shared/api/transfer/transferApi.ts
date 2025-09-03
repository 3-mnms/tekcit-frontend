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
  TransferStatusBEString,
} from '@/models/transfer/transferTypes';
import { FRtoBEString } from '@/models/transfer/transferTypes';

const PATH = {
  extract: '/transfer/extract',
  request: '/transfer/request',
  watch: '/transfer/watch',
  acceptanceFamily: '/transfer/acceptance/family', // @RequestBody UpdateTicketRequestDTO
  acceptanceOthers: '/transfer/acceptance/others', // @RequestBody UpdateTicketRequestDTO
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

export async function apiVerifyFamily(payload: ExtractPayload): Promise<{ success: boolean; message?: string }> {
  const form = new FormData();
  form.append('file', payload.file);
  form.append('targetInfo', JSON.stringify(payload.targetInfo));

  // 👇 이 호출은 unwrap 하지 않는다!
  const res = await api.post(PATH.extract, form, { validateStatus: () => true });
  if (res.status >= 400) {
    throw new Error(`${res.status} ${(res.data as any)?.message ?? res.statusText}`);
  }

  const d = res.data as any; // 예: { success: true, data: null, message: '...' }
  return { success: d?.success === true, message: d?.message };
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

/* ============== 공통 변환 ============== */
type UpdateTicketRequestBE = {
  transferId: number;
  senderId: number;
  transferStatus: TransferStatusBEString;        // 'APPROVED' | 'CANCELED' | 'REQUESTED'
  deliveryMethod?: 'QR' | 'PAPER' | '' | null;
  address?: string | null;
};

// 프론트표기(ACCEPTED/REJECTED/PENDING) → 서버문자열(APPROVED/CANCELED/REQUESTED)
function toBEBody(fr: UpdateTicketRequest): UpdateTicketRequestBE {
  const be: UpdateTicketRequestBE = {
    transferId: fr.transferId,
    senderId: fr.senderId,
    transferStatus: FRtoBEString(fr.transferStatus),
    deliveryMethod: (fr.deliveryMethod ?? null) as any,
    address:
      fr.transferStatus === 'ACCEPTED'
        ? (fr.deliveryMethod === 'PAPER' ? (fr.address ?? '') : null)
        : null, // 거절/PENDING이면 null
  };
  return stripNullish(be) as UpdateTicketRequestBE;
}

/* ============== 가족(수락/거절 공용) ============== */
export async function apiRespondFamily(body: UpdateTicketRequest): Promise<void> {
  const mapped = toBEBody(body);
  const res = await api.put<ApiEnvelope<null> | null>(
    PATH.acceptanceFamily,
    mapped,
    { validateStatus: () => true },
  );

  if (res.status >= 400) {
    console.error('[apiRespondFamily] 4xx/5xx', res.status, res.data, { url: PATH.acceptanceFamily, sent: mapped });
    throw new Error(`${res.status} ${(res.data as any)?.message ?? (res.data as any)?.errorMessage ?? res.statusText}`);
  }
}

/* ============== 지인(수락/거절 공용) ============== */
export async function apiRespondOthers(body: UpdateTicketRequest): Promise<TransferOthersResponse> {
  const mapped = toBEBody(body);
  const res = await api.put<ApiEnvelope<TransferOthersResponse> | TransferOthersResponse>(
    PATH.acceptanceOthers,
    mapped,
    { validateStatus: () => true },
  );

  if (res.status >= 400) {
    console.error('[apiRespondOthers] 4xx/5xx', res.status, res.data, { url: PATH.acceptanceOthers, sent: mapped });
    throw new Error(`${res.status} ${(res.data as any)?.message ?? (res.data as any)?.errorMessage ?? res.statusText}`);
  }

  const data = (res.data && ((res.data as any).data ?? res.data)) as TransferOthersResponse;
  return data;
}
