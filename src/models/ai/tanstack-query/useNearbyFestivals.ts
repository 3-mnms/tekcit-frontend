import { useQuery } from '@tanstack/react-query';
import { getNearbyFestivals, apiGetNearbyActivities, type NearbyFestivalListDTO, type RecommendDTO } from '@/shared/api/ai/nearbyApi';

export const QK = {
  nearbyFestivals: ['festival', 'nearby'] as const,
};

export const useNearbyFestivalsQuery = () =>
  useQuery<NearbyFestivalListDTO>({
    queryKey: QK.nearbyFestivals,
    queryFn: getNearbyFestivals,
    staleTime: 60_000,
  });

export const qkNearbyActivities = () => ['nearby', 'activities'] as const;

export function useNearbyActivities() {
  return useQuery({
    queryKey: qkNearbyActivities(),
    queryFn: apiGetNearbyActivities,
    staleTime: 5 * 60 * 1000,
  });
}

/** 편의 셀렉터: 특정 festivalDetailId용 추천 묶음 골라내기 */
export function pickRecommendForFestival(list: RecommendDTO[] | undefined, fid?: string | null) {
  if (!list || !fid) return undefined;
  return list.find((r) => String(r.festivalDetailId) === String(fid));
}