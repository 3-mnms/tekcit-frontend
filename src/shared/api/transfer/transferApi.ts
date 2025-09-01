import { api } from '@/shared/config/axios';
import type {
  ExtractPayload,
  ExtractResponse,
  UpdateTicketRequest,
  TicketTransferRequest,
  ApiEnvelope,
  ApiOk,
  ApiErr,
} from '@/models/transfer/transferTypes';

/** 공통 경로 (baseURL이 http://.../api 인 상황) */
const PATH = {
  extract: '/transfer/extract',
  update: (id: number | string) => `/transfer/${id}`,
  request: '/transfer/request',
};

/** 안전 언랩: Ok/Err 래퍼 또는 생데이터 모두 대응 */
function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'success' in (payload as any)) {
    const p = payload as ApiOk<T> | ApiErr;
    if ((p as ApiOk<T>).success === true) {
      const ok = p as ApiOk<T>;
      if (ok.data !== undefined && ok.data !== null) return ok.data;
      throw new Error('Empty response data');
    }
    const err = p as ApiErr;
    throw new Error(err.errorMessage || err.message || err.errorCode || 'API error');
  }
  // 서버가 바로 데이터(T)를 주는 케이스
  return payload as T;
}

/** 가족관계증명서 OCR 인증 (multipart/form-data) */
export async function apiExtractPersonInfo(payload: ExtractPayload): Promise<ExtractResponse> {
  const form = new FormData();
  form.append('file', payload.file);
  form.append('targetInfo', JSON.stringify(payload.targetInfo)); // @RequestPart("targetInfo") String(JSON)

  const res = await api.post<ApiEnvelope<ExtractResponse> | ExtractResponse>(
    PATH.extract,
    form,
    { validateStatus: () => true }
  );

  if (res.status === 404) {
    throw new Error('404 Not Found: /transfer/extract 엔드포인트 라우팅/경로를 확인해 주세요.');
  }
  if (res.status >= 400) {
    const msg = (res.data as any)?.message ?? res.statusText ?? '요청 실패';
    throw new Error(`${res.status} ${msg}`);
  }
  return unwrap<ExtractResponse>(res.data);
}

/** 가족 간 양도 완료(승인) */
export async function apiUpdateFamilyTransfer(
  ticketId: number | string,
  body: UpdateTicketRequest,
): Promise<void> {
  const res = await api.put<ApiEnvelope<null> | null>(
    PATH.update(ticketId),
    body,
    { validateStatus: () => true }
  );

  if (res.status === 404) {
    throw new Error(`404 Not Found: /transfer/${ticketId} 엔드포인트가 없어요. 라우팅/경로를 확인해 주세요.`);
  }
  if (res.status >= 400) {
    const msg = (res.data as any)?.message ?? res.statusText ?? '요청 실패';
    throw new Error(`${res.status} ${msg}`);
  }
  unwrap<null>(res.data ?? null);
}

export async function apiRequestTransfer(body: TicketTransferRequest): Promise<void> {
  const res = await api.post<ApiEnvelope<null> | null>(PATH.request, body, {
    validateStatus: () => true,
  });

  if (res.status === 404) {
    throw new Error('404 Not Found: /transfer/request 라우팅을 확인해 주세요.');
  }
  if (res.status >= 400) {
    const msg =
      (res.data as any)?.message ||
      (res.data as any)?.errorMessage ||
      res.statusText ||
      '요청 실패';
    throw new Error(`${res.status} ${msg}`);
  }

  // 백엔드가 SuccessResponse<Void>를 주므로 data는 null일 수 있음
  unwrap<null>(res.data ?? null);
}