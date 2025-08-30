import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getFestivalReviews,
  getMyFestivalReview,
  createFestivalReview,
  updateFestivalReview,
  deleteFestivalReview,
} from '@/shared/api/festival/review';
import type { FestivalReviewRequestDTO, ReviewSort } from '@/models/festival/reviewTypes';

const reviewKeys = {
  all: (fid: string) => ['reviews', fid] as const,
  page: (fid: string, sort: ReviewSort, page: number) => ['reviews', fid, sort, page] as const,
  me: (fid: string) => ['reviews', fid, 'me'] as const,
};

export function useFestivalReviews(fid: string, sort: ReviewSort, page: number) {
  return useQuery({
    queryKey: reviewKeys.page(fid, sort, page),
    queryFn: () => getFestivalReviews(fid, sort, page),
    staleTime: 1000 * 30,
  });
}

export function useMyFestivalReview(fid: string) {
  return useQuery({
    queryKey: reviewKeys.me(fid),
    queryFn: () => getMyFestivalReview(fid),
    staleTime: 1000 * 30,
  });
}

export function useCreateFestivalReview(fid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FestivalReviewRequestDTO) => createFestivalReview(fid, payload),
    onSuccess: () => {
      // fid 관련 리뷰 쿼리 전부 무효화
      qc.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'reviews' && q.queryKey[1] === fid,
      });
    },
  });
}

// ✅ 리팩토링: 삭제는 vars로 fid/rId를 받아 유연하게
export function useDeleteFestivalReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ fid, rId }: { fid: string; rId: number }) => deleteFestivalReview(fid, rId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'reviews' && q.queryKey[1] === vars.fid,
      });
    },
  });
}

// (선택) 수정 훅도 동일 패턴으로
export function useUpdateFestivalReview(fid: string, rId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FestivalReviewRequestDTO) => updateFestivalReview(fid, rId, payload),
    onSuccess: () => {
      qc.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'reviews' && q.queryKey[1] === fid,
      });
    },
  });
}
