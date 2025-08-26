import { api } from '@/shared/config/axios';
import type {
  ApiSuccessResponse,
  FestivalItem,
  FestivalSearchParams,
} from '@models/festival/FestivalSearchTypes';

// 내부 정규화(필드 보강용)
const normalizeFestivalItem = <T extends FestivalItem>(raw: T): T => {
  const poster = (raw as any).poster || '';
  const contentFiles =
    (raw as any).contentFiles && Array.isArray((raw as any).contentFiles)
      ? (raw as any).contentFiles
      : undefined;

  return {
    ...raw,
    poster,
    ...(contentFiles ? { contentFiles } : {}),
  };
};

/**
 * ✅ 공연 검색
 * - 빈 값은 쿼리에 포함하지 않음
 * - 응답 래퍼에서 data만 꺼냄
 */
export const searchFestivals = async (
  p: FestivalSearchParams = {}
): Promise<FestivalItem[]> => {
  const params = new URLSearchParams();

  if (p.genre?.trim()) params.set('genre', p.genre.trim());
  if (p.keyword?.trim()) params.set('keyword', p.keyword.trim());
  if (typeof p.page === 'number') params.set('page', String(p.page));
  if (typeof p.size === 'number') params.set('size', String(p.size));

  const { data } = await api.get<ApiSuccessResponse<FestivalItem[]>>(
    '/festival/search',
    { params }
  );

  if (!data?.success) {
    throw new Error('검색 응답이 올바르지 않습니다.');
  }
  if (!Array.isArray(data.data)) {
    throw new Error('검색 결과 형식이 배열이 아닙니다.');
  }

  return data.data.map(normalizeFestivalItem);
};
