import { api } from '@/shared/config/axios';
import type { Festival, FestivalDetail } from '@/models/festival/festivalType';

type SuccessResponse<T> = { data: T; message?: string };
type ReqOpt = { signal?: AbortSignal };

// 목록
export const getFestivals = async (opt?: ReqOpt): Promise<Festival[]> => {
  const res = await api.get<SuccessResponse<{ content: Festival[] }>>('/festival', {
    signal: opt?.signal,
  });
  return res.data.data.content;
};

// 카테고리
export const getFestivalCategories = async (opt?: ReqOpt): Promise<string[]> => {
  const res = await api.get<SuccessResponse<string[]>>('/festival/categories', {
    signal: opt?.signal,
  });
  return res.data.data;
};

// 조회수 단건 조회
export const getFestivalViews = async (fid: string, opt?: ReqOpt): Promise<number> => {
  const res = await api.get<SuccessResponse<number>>(`/festival/views/${fid}`, {
    signal: opt?.signal,
  });
  return res.data.data;
};

// 상세 (⚠️ 엔드포인트/로직 변경 없음)
export const getFestivalDetail = async (fid: string, opt?: ReqOpt): Promise<FestivalDetail> => {
  const res = await api.get<SuccessResponse<FestivalDetail>>(`/festival/${fid}`, {
    signal: opt?.signal,
  });
  return res.data.data;
};

// 조회수 증가(POST)
export const increaseFestivalViews = async (fid: string, opt?: ReqOpt): Promise<number> => {
  const res = await api.post<SuccessResponse<number>>(`/festival/views/${fid}`, undefined, {
    signal: opt?.signal,
  });
  return res.data.data;
};
