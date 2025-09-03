import { api } from '@/shared/config/axios';
import type { WaitingNumberResponseDTO } from '@/models/waiting/waitingTypes';
import { toLocalDateTimeParam } from '@/models/waiting/waitingTypes';

type SuccessResponse<T> = { data: T; message?: string };
type ReqOpt = { signal?: AbortSignal };

/**
 * 예매하기 버튼 클릭 시: 대기열 진입 or 즉시 입장
 * GET /api/booking/enter?festivalId=...&reservationDate=yyyy-MM-dd'T'HH:mm:ss
 */
export async function apiEnterWaitingQueue(
  festivalId: string,
  reservationDate: Date,
  opt?: ReqOpt,
): Promise<WaitingNumberResponseDTO> {
  const res = await api.get<SuccessResponse<WaitingNumberResponseDTO>>('/booking/enter', {
    signal: opt?.signal,
    params: {
      festivalId,
      reservationDate: toLocalDateTimeParam(reservationDate),
    },
  });
  return res.data.data;
}

/**
 * 예매 페이지 퇴장 → 다음 대기자 입장 처리
 * GET /api/booking/release?festivalId=...&reservationDate=...
 */
export async function apiReleaseUserFromBooking(
  festivalId: string,
  reservationDate: Date,
  opt?: ReqOpt,
): Promise<string> {
  const res = await api.get<SuccessResponse<string>>('/booking/release', {
    signal: opt?.signal,
    params: {
      festivalId,
      reservationDate: toLocalDateTimeParam(reservationDate),
    },
  });
  return res.data.data;
}

/**
 * 대기열에서 스스로 퇴장
 * GET /api/booking/exit?festivalId=...&reservationDate=...
 */
export async function apiExitWaitingQueue(
  festivalId: string,
  reservationDate: Date,
  opt?: ReqOpt,
): Promise<string> {
  const res = await api.get<SuccessResponse<string>>('/booking/exit', {
    signal: opt?.signal,
    params: {
      festivalId,
      reservationDate: toLocalDateTimeParam(reservationDate),
    },
  });
  return res.data.data;
}
