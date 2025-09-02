import { api } from '@/shared/config/axios';
import type {
  ExtractPayload,
  ExtractResponse,
  UpdateTicketRequest,
  TicketTransferRequest,
  TransferWatchItem,
  ApiEnvelope,
  ApiOk,
  ApiErr,
} from '@/models/transfer/transferTypes';

/** 공통 경로 (baseURL이 http://.../api 인 상황) */
const PATH = {
  extract: '/transfer/extract',
  update: (id: number | string) => `/transfer/${id}`,
  request: '/transfer/request',
  watch: '/transfer/watch',
};

/** ✅ CHANGED: 안전 언랩
 * - success=true인데 data가 null/undefined여도 "성공"으로 간주 (throw 하지 않음)
 * - data가 없으면 `undefined as T`를 반환하고, 호출부에서 기본값 처리
 */
function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'success' in (payload as any)) {
    const p = payload as ApiOk<T> | ApiErr;
    if ((p as ApiOk<T>).success === true) {
      const ok = p as ApiOk<T>;
      if (ok.data !== undefined && ok.data !== null) return ok.data;
      // data가 비어있어도 성공으로 간주 (Void/Null 응답)
      return undefined as T;
    }
    const err = p as ApiErr;
    // 에러 메시지도 안전하게 추출
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
  // ✅ CHANGED: 성공 시 data 없어도 조용히 통과
  unwrap<null>(res.data ?? null);
}

/** ✅ CHANGED: 양도 요청
 * - 409면 깔끔한 한국어 메세지로 throw → 컴포넌트에서 alert에 그대로 쓰면 됨
 * - 2xx면 body 없어도 성공 처리 (Empty response data 방지)
 */
export async function apiRequestTransfer(body: TicketTransferRequest): Promise<void> {
  const res = await api.post<ApiEnvelope<null> | null>(PATH.request, body, {
    validateStatus: () => true,
  });

  if (res.status === 404) {
    throw new Error('404 Not Found: /transfer/request 라우팅을 확인해 주세요.');
  }

  // 409: 이미 진행/완료 → 우리 지정 문구로 치환
  if (res.status === 409) {
    throw new Error('이미 양도처리된 티켓입니다.');
  }

  if (res.status >= 400) {
    const msg =
      (res.data as any)?.message ||
      (res.data as any)?.errorMessage ||
      res.statusText ||
      '요청 실패';
    throw new Error(`${res.status} ${msg}`);
  }

  // 백엔드가 SuccessResponse<Void>를 주므로 data는 null일 수 있음 → 성공 처리
  // (컴포넌트에서 res.data 검사 안해도 조용)
  // unwrap 호출해도 throw 안 남 (위에서 변경)
  unwrap<null>(res.data ?? null);
}

/** ✅ CHANGED: watch
 * - 404면 에러 대신 빈 배열([]) 반환 → 첫 시도부터 noisy 404를 없앰
 * - 204/empty도 빈 배열로
 */
export async function apiWatchTransfer(): Promise<TransferWatchItem[]> {
  const res = await api.get<ApiEnvelope<TransferWatchItem[]> | TransferWatchItem[]>(
    PATH.watch,
    { validateStatus: () => true }
  );

  if (res.status === 404) {
    // 아직 백엔드 라우트 없거나 최초 시도 시 비활성화 상태 → 조용히 빈 리스트
    return [];
  }
  if (res.status >= 400) {
    const msg = (res.data as any)?.message ?? res.statusText ?? '요청 실패';
    throw new Error(`${res.status} ${msg}`);
  }

  const data = unwrap<TransferWatchItem[] | undefined>(res.data);
  return Array.isArray(data) ? data : []; // 204/empty → []
}
