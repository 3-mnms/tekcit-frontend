// shared/api/waiting/WaitingApi.ts
import { api } from '@/shared/config/axios';
import type {
  WaitingNumberResponseDTO,
  EnterWaitingParams,
  ExitOrReleaseParams,
} from '@/models/waiting/waitingTypes';

type SuccessResponse<T> = { data: T; message?: string };

export const enterWaiting = async (
  params: EnterWaitingParams,
  opt?: { signal?: AbortSignal }
): Promise<WaitingNumberResponseDTO> => {
  const res = await api.get<SuccessResponse<WaitingNumberResponseDTO>>(
    '/booking/enter',
    { params, signal: opt?.signal }
  );
  return res.data.data;
};

export const releaseUser = async (
  params: ExitOrReleaseParams,
  opt?: { signal?: AbortSignal }
): Promise<string> => {
  const res = await api.get<SuccessResponse<string>>('/booking/release', {
    params,
    signal: opt?.signal,
  });
  return res.data.message ?? res.data.data ?? 'OK';
};

export const exitWaitingUser = async (
  params: ExitOrReleaseParams,
  opt?: { signal?: AbortSignal }
): Promise<string> => {
  const res = await api.get<SuccessResponse<string>>('/booking/exit', {
    params,
    signal: opt?.signal,
  });
  return res.data.message ?? res.data.data ?? 'OK';
};
