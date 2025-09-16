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

/** ✅ BE status 정규화: 숫자/철자 변형 → 표준 문자열(REQUESTED|APPROVED|COMPLETED|CANCELED) */
function normalizeBEStatus(s: unknown): TransferStatusBEString {
  if (typeof s === 'number') {
    return (['REQUESTED','APPROVED','COMPLETED','CANCELED'][s] ?? 'REQUESTED') as TransferStatusBEString;
  }
  const v = String(s ?? '').trim().toUpperCase();
  if (['0','REQUEST','REQUESTED','PENDING','WAITING'].includes(v)) return 'REQUESTED';
  if (['1','APPROVED','ACCEPTED','OK'].includes(v)) return 'APPROVED';
  if (['2','COMPLETED','DONE','SUCCESS'].includes(v)) return 'COMPLETED';
  if (['3','CANCELED','CANCELLED','REJECTED','DENIED','DECLINED'].includes(v)) return 'CANCELED';
  return 'REQUESTED';
}

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
    // 인박스형
    '/transfer/watch',
    '/transfer/requests/watch',
    '/transfer/requests/inbox',
    '/transfer/inbox',
    // 히스토리/전체형(팀마다 네이밍 다름, 전부 시도)
    '/transfer/history',
    '/transfer/records',
    '/transfer/watch/all',
    '/transfer/requests/all',
    '/transfer/list',
  ];

  // 공통 쿼리: recipient 기준이라고 가정
  const uspBase = new URLSearchParams();
  if (typeof userId === 'number' && Number.isFinite(userId)) {
    uspBase.set('userId', String(userId));       // 혹시 recipientId를 요구한다면 아래 줄도 켜보기
    uspBase.set('recipientId', String(userId));  // ← 서버 구현 따라 한쪽만 보거나 둘 다 봄
  }

  // ❗ 완료/거절까지 포함하도록 최대한 많은 힌트 제공
  if (includeCanceled) {
    uspBase.set('includeCanceled', '1');
    uspBase.set('includeCancelled', '1');
    uspBase.set('includeRejected', '1');
    uspBase.set('includeCompleted', '1');
    uspBase.set('all', '1');
    uspBase.set('status', 'ALL');
    uspBase.set('statuses', 'REQUESTED,APPROVED,COMPLETED,CANCELED');
  }

  // 캐시버스터 (프록시/게이트웨이 캐시 무력화)
  uspBase.set('_t', String(Date.now()));

  let lastErr: unknown = null;

  for (const path of candidates) {
    try {
      const usp = new URLSearchParams(uspBase);
      const url = `${path}${usp.toString() ? `?${usp.toString()}` : ''}`;
      const res = await api.get<ApiEnvelope<TransferWatchItem[]> | TransferWatchItem[]>(url, {
        validateStatus: () => true,
      });
      if (res.status === 404) continue;
      if (res.status >= 400) { lastErr = new Error(`${res.status} ${(res.data as any)?.message ?? res.statusText}`); continue; }

      const raw = unwrap<TransferWatchItem[]>(res.data) ?? [];
      // 표준화(REQUESTED|APPROVED|COMPLETED|CANCELED)
      const normalized = raw.filter(Boolean).map((it) => ({
        ...it,
        status: normalizeBEStatus((it as any).status),
      }));
      
      console.log('[apiWatchTransfer] path:', path, 
            '\nraw:', raw, 
            '\nnormalized:', normalized);

      if (normalized.length) return normalized; // 첫 성공 경로 반환
    } catch (e) {
      lastErr = e;
      continue;
    }
  }

  // 마지막 에러 터뜨려서 침묵 실패 방지
  if (lastErr) throw (lastErr instanceof Error ? lastErr : new Error(String(lastErr)));
  return [];
}

/* ============== 공통 변환 ============== */
type UpdateTicketRequestBE = {
  transferId: number;
  senderId: number;
  transferStatus: TransferStatusBEString;        // 'REQUESTED' | 'APPROVED' | 'COMPLETED' | 'CANCELED'
  deliveryMethod?: 'QR' | 'PAPER';
  address?: string;
};

// 프론트표기(ACCEPTED/REJECTED/PENDING) → 서버문자열(요청/승인/취소)
// ⚠️ 비즈니스 흐름상 "수락 직후 = APPROVED", "최종 완료 = COMPLETED" 이면 아래 매핑 유지가 안전
function toBEBody(fr: UpdateTicketRequest): UpdateTicketRequestBE {
  const status = FRtoBEString(fr.transferStatus);

  // ❌ 거절/PENDING이면 배송 관련 키 자체를 보내지 않음 (깨끗한 바디)
  if (fr.transferStatus !== 'ACCEPTED') {
    return {
      transferId: fr.transferId,
      senderId: fr.senderId,
      transferStatus: status,
    };
  }

  // ✅ 수락(ACCEPTED)
  if (fr.deliveryMethod === 'PAPER') {
    return {
      transferId: fr.transferId,
      senderId: fr.senderId,
      transferStatus: status, // 보통 APPROVED
      deliveryMethod: 'PAPER',
      address: fr.address ?? '',
    };
  }
  return {
    transferId: fr.transferId,
    senderId: fr.senderId,
    transferStatus: status,   // 보통 APPROVED
    deliveryMethod: 'QR',
  };
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
