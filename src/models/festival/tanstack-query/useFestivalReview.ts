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
      qc.invalidateQueries({ queryKey: reviewKeys.all(fid) });
    },
  });
}

export function useUpdateFestivalReview(fid: string, rId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FestivalReviewRequestDTO) => updateFestivalReview(fid, rId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewKeys.all(fid) });
    },
  });
}

export function useDeleteFestivalReview(fid: string, rId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deleteFestivalReview(fid, rId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewKeys.all(fid) });
    },
  });
}
