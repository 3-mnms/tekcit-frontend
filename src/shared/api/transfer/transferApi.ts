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
  TransferStatusBE,
  TicketPick,
  TransferType,
} from '@/models/transfer/transferTypes';
import {
  FRtoBEString,
  deliveryConstraintFromPick,
} from '@/models/transfer/transferTypes';

/* ============== PATH ============== */
const PATH = {
  extract: '/transfer/extract',
  request: '/transfer/request',
  watch: '/transfer/watch',
  acceptanceFamily: '/transfer/acceptance/family',
  acceptanceOthers: '/transfer/acceptance/others',
};

/* ============== 상태 정규화(원래 스타일 유지) ============== */
function normalizeBEStatus(s: unknown): TransferStatusBEString {
  if (typeof s === 'number') {
    return (['REQUESTED', 'APPROVED', 'COMPLETED', 'CANCELED'][s] ?? 'REQUESTED') as TransferStatusBEString;
  }
  const v = String(s ?? '').trim().toUpperCase();
  if (['0', 'REQUEST', 'REQUESTED', 'PENDING', 'WAITING'].includes(v)) return 'REQUESTED';
  if (['1', 'APPROVED', 'ACCEPTED', 'OK'].includes(v)) return 'APPROVED';
  if (['2', 'COMPLETED', 'DONE', 'SUCCESS'].includes(v)) return 'COMPLETED';
  if (['3', 'CANCELED', 'CANCELLED', 'REJECTED', 'DENIED', 'DECLINED'].includes(v)) return 'CANCELED';
  return 'REQUESTED';
}

/* ============== Envelope 유틸(원래 형태 유지) ============== */
function isApiOk<T>(env: ApiEnvelope<T>): env is ApiOk<T> {
  return typeof env === 'object' && env !== null && 'success' in env && (env as ApiOk<T>).success === true;
}
function isApiErr<T>(env: ApiEnvelope<T>): env is ApiErr {
  return typeof env === 'object' && env !== null && 'success' in env && (env as ApiErr).success === false;
}
function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  if (typeof payload === 'object' && payload !== null && 'success' in (payload as any)) {
    const env = payload as ApiEnvelope<T>;
    if (isApiOk(env)) return env.data;
    if (isApiErr(env)) {
      const msg = env.errorMessage || env.message || env.errorCode || 'API error';
      throw new Error(msg);
    }
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
  if (res.status >= 400) {
    const msg = typeof res.data === 'object' && res.data !== null && 'message' in res.data
      ? (res.data as { message?: string }).message ?? res.statusText
      : res.statusText;
    throw new Error(`${res.status} ${msg}`);
  }
  return unwrap<ExtractResponse>(res.data as ApiEnvelope<ExtractResponse> | ExtractResponse);
}

export async function apiVerifyFamily(payload: ExtractPayload): Promise<{ success: boolean; message?: string }> {
  const form = new FormData();
  form.append('file', payload.file);
  form.append('targetInfo', JSON.stringify(payload.targetInfo));

  // 이 호출은 unwrap 하지 않음 (원래 스타일 유지)
  const res = await api.post(PATH.extract, form, { validateStatus: () => true });
  if (res.status >= 400) {
    const msg = typeof res.data === 'object' && res.data !== null && 'message' in res.data
      ? (res.data as { message?: string }).message
      : res.statusText;
    throw new Error(`${res.status} ${msg}`);
  }

  const d = res.data as any; // { success: true, data: null, message: '...' }
  return { success: d?.success === true, message: d?.message };
}

/* ============== 요청/조회 ============== */
export async function apiRequestTransfer(body: TicketTransferRequest): Promise<void> {
  const res = await api.post<ApiEnvelope<null> | null>(PATH.request, body, { validateStatus: () => true });
  if (res.status >= 400) {
    const msg = typeof res.data === 'object' && res.data !== null && 'message' in res.data
      ? (res.data as { message?: string }).message
      : res.statusText;
    throw new Error(`${res.status} ${msg}`);
  }
  unwrap<null>(res.data ?? null);
}

/** ✅ WATCH: ticketPick 미포함 응답도 안전하게 보정(1=ALL) */
export async function apiWatchTransfer(
  userId?: number,
  includeCanceled?: boolean
): Promise<TransferWatchItem[]> {
  // ✅ 오직 /transfer/watch 만 사용
  const usp = new URLSearchParams();

  if (typeof userId === 'number' && Number.isFinite(userId)) {
    usp.set('userId', String(userId));
    usp.set('recipientId', String(userId)); // 서버가 둘 중 하나만 보더라도 대응
  }

  if (includeCanceled) {
    usp.set('includeCanceled', '1');
    usp.set('statuses', 'REQUESTED,APPROVED,COMPLETED,CANCELED');
  }

  // 캐시 버스터
  usp.set('_t', String(Date.now()));

  const url = `${PATH.watch}?${usp.toString()}`;

  const res = await api.get<ApiEnvelope<any> | any>(url, { validateStatus: () => true });
  if (res.status >= 400) {
    const msg = (res.data && (res.data.message || res.data.errorMessage)) || res.statusText;
    throw new Error(`${res.status} ${msg}`);
  }

  // Envelope/Raw 모두 대응
  const body = res.data as any;
  const rawArr: any[] = Array.isArray(body)
    ? body
    : (body && typeof body === 'object' && Array.isArray(body.data))
      ? body.data
      : [];

  // 정상화 (ticketPick 확실히 집어옴)
  const list: TransferWatchItem[] = rawArr.filter(Boolean).map((r: any) => {
    // status 표준화 (이 파일에 있는 normalizeBEStatus 사용)
    const beStatus: TransferStatusBEString = normalizeBEStatus(r?.status);

    // type 표준화
    const tUpper = String(r?.transferType ?? r?.type ?? '').trim().toUpperCase();
    const typeStd: TransferType | string = tUpper === 'FAMILY' ? 'FAMILY' : 'OTHERS';

    // ✅ ticketPick: BE가 주는 camel/snake 둘 다 대응, 누락이면 1(ALL)
    const rawPick = r?.ticketPick ?? r?.ticket_pick;
    const pick: TicketPick = Number(rawPick) === 2 ? 2 : 1;
    const derived = deliveryConstraintFromPick(pick);

    const item: TransferWatchItem = {
      transferId: Number(r?.transferId),
      senderId: Number(r?.senderId),
      senderName: String(r?.senderName ?? ''),
      type: typeStd,
      createdAt: String(r?.createdAt ?? ''),
      status: beStatus,

      fname: String(r?.fname ?? ''),
      posterFile: String(r?.posterFile ?? ''),
      fcltynm: String(r?.fcltynm ?? ''),
      ticketPrice: Number(r?.ticketPrice ?? 0),

      performanceDate: String(r?.performanceDate ?? ''),
      reservationNumber: String(r?.reservationNumber ?? ''),
      selectedTicketCount: Number(r?.selectedTicketCount ?? 0),

      ticketPick: pick,                 // 1 | 2
      deliveryConstraint: derived,      // 'ALL' | 'QR_ONLY'
    };
    return item;
  });

  return list;
}


/* ============== 공통 변환 ============== */
type UpdateTicketRequestBE = {
  transferId: number;
  senderId: number;
  transferStatus: TransferStatusBEString;
  deliveryMethod?: 'QR' | 'PAPER';
  address?: string;
};

/** 프론트표기 → 서버문자열 매핑 (원래 비즈니스 흐름 유지) */
function toBEBody(fr: UpdateTicketRequest): UpdateTicketRequestBE {
  const status = FRtoBEString(fr.transferStatus);

  if (fr.transferStatus !== 'ACCEPTED') {
    return {
      transferId: fr.transferId,
      senderId: fr.senderId,
      transferStatus: status,
    };
  }

  if (fr.deliveryMethod === 'PAPER') {
    return {
      transferId: fr.transferId,
      senderId: fr.senderId,
      transferStatus: status, // 보통 APPROVED/COMPLETED 중 정책대로
      deliveryMethod: 'PAPER',
      address: fr.address ?? '',
    };
  }
  return {
    transferId: fr.transferId,
    senderId: fr.senderId,
    transferStatus: status,
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
    const err = res.data as ApiErr | undefined;
    const msg = err?.message ?? err?.errorMessage ?? res.statusText;
    // eslint-disable-next-line no-console
    console.error('[apiRespondFamily] 4xx/5xx', res.status, res.data, { url: PATH.acceptanceFamily, sent: mapped });
    throw new Error(`${res.status} ${msg}`);
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
    const err = res.data as ApiErr | undefined;
    const msg = err?.message ?? err?.errorMessage ?? res.statusText;
    // eslint-disable-next-line no-console
    console.error('[apiRespondOthers] 4xx/5xx', res.status, res.data, { url: PATH.acceptanceOthers, sent: mapped });
    throw new Error(`${res.status} ${msg}`);
  }

  const env = res.data as ApiEnvelope<TransferOthersResponse>;
  const data = isApiOk(env) ? env.data : (res.data as TransferOthersResponse);
  return data;
}
