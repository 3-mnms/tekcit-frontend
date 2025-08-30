import { api } from '@/shared/config/axios';
import type {
  FestivalReviewRequestDTO,
  FestivalReviewResultDTO,
  FestivalReviewResponseDTO,
  ReviewSort,
} from '@/models/festival/reviewTypes';

// 공통 언래핑 (네가 쓰는 unwrap 패턴과 동일 느낌 유지)
const unwrap = <T,>(res: any): T => {
  if (!res) throw new Error('empty response');
  if (res.success === true || res.status === 'SUCCESS') return (res.data ?? res) as T;
  if (res.data) return unwrap<T>(res.data);
  return res as T;
};

// GET /api/festival/review/{fId}?sort=&page=
export async function getFestivalReviews(
  fId: string,
  sort: ReviewSort = 'desc',
  page = 0
): Promise<FestivalReviewResultDTO> {
  const { data } = await api.get(`/festival/review/${encodeURIComponent(fId)}`, {
    params: { sort, page },
  });
  return unwrap<FestivalReviewResultDTO>(data);
}

// GET /api/festival/review/{fId}/myReview
export async function getMyFestivalReview(fId: string): Promise<FestivalReviewResponseDTO | null> {
  const { data } = await api.get(`/festival/review/${encodeURIComponent(fId)}/myReview`);
  // 본인 리뷰가 없을 때 200 + null 로 온다고 가정
  return unwrap<FestivalReviewResponseDTO | null>(data);
}

// POST /api/festival/review/{fId}
export async function createFestivalReview(
  fId: string,
  payload: FestivalReviewRequestDTO
): Promise<FestivalReviewResponseDTO> {
  const { data } = await api.post(`/festival/review/${encodeURIComponent(fId)}`, payload);
  return unwrap<FestivalReviewResponseDTO>(data);
}

// PATCH /api/festival/review/{fId}/{rId}
export async function updateFestivalReview(
  fId: string,
  rId: number,
  payload: FestivalReviewRequestDTO
): Promise<FestivalReviewResponseDTO> {
  const { data } = await api.patch(`/festival/review/${encodeURIComponent(fId)}/${rId}`, payload);
  return unwrap<FestivalReviewResponseDTO>(data);
}

// DELETE /api/festival/review/{fId}/{rId}
export async function deleteFestivalReview(fId: string, rId: number): Promise<void> {
  const { data } = await api.delete(`/festival/review/${encodeURIComponent(fId)}/${rId}`);
  unwrap<void>(data);
}
