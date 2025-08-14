// shared/api/festival/FestivalApi.ts
import axios from 'axios';
import type { Festival, FestivalDetail } from '@models/festival/FestivalType';

type SuccessResponse<T> = { data: T; message?: string };

export const getFestivals = async (): Promise<Festival[]> => {
  const res = await axios.get<SuccessResponse<{ content: Festival[] }>>('/api/festival');
  return res.data.data.content;
};

export const getFestivalCategories = async (): Promise<string[]> => {
  const res = await axios.get<SuccessResponse<string[]>>('/api/festival/categories');
  return res.data.data;
};

export const getFestivalViews = async (fid: string): Promise<number> => {
  const res = await axios.get<SuccessResponse<number>>(`/api/festival/views/${fid}`);
  return res.data.data;
};

// ✅ 상세 조회: models 타입 재사용
export const getFestivalDetail = async (fid: string): Promise<FestivalDetail> => {
  const res = await axios.get<SuccessResponse<FestivalDetail>>(`/api/festival/${fid}`);
  return res.data.data;
};

// ✅ 조회수 증가(POST)
export const increaseFestivalViews = async (fid: string): Promise<number> => {
  const res = await axios.post<SuccessResponse<number>>(`/api/festival/views/${fid}`);
  return res.data.data;
};
