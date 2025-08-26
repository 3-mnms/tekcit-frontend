// src/models/festival/tanstack-query/useFestivalDetail.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { getFestivalDetail, increaseFestivalViews } from '@/shared/api/festival/festivalApi';
import type { FestivalDetail } from '@/models/festival/festivalType';

export function useFestivalDetail(fid?: string) {
  return useQuery<FestivalDetail>({
    queryKey: ['festivalDetail', fid],
    queryFn: () => getFestivalDetail(fid!),
    enabled: !!fid,
  });
}

export function useIncreaseViews() {
  return useMutation({
    mutationFn: (fid: string) => increaseFestivalViews(fid),
  });
}
