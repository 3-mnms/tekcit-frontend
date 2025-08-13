import axios from 'axios';
import type { ApiSuccessResponse, FestivalItem, FestivalSearchParams } from '@models/festival/FestivalSearchTypes';

export const searchFestivals = async (p: FestivalSearchParams): Promise<FestivalItem[]> => {
  // 빈 값은 보내지 않도록 필터링
  const params: Record<string, string> = {};
  if (p.genre) params.genre = p.genre;
  if (p.keyword) params.keyword = p.keyword;

  const res = await axios.get<ApiSuccessResponse<FestivalItem[]>>('/api/festival/search', { params });

  // 래퍼에서 실제 리스트 꺼내기
  return res.data.data; // ← SuccessResponse<T>의 실제 필드명 확인 필요
};