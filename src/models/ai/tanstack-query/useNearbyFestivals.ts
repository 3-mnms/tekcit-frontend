import { useQuery } from '@tanstack/react-query';
import { getNearbyFestivals, type NearbyFestivalListDTO } from '@/shared/api/ai/nearbyApi';

export const QK = {
  nearbyFestivals: ['festival', 'nearby'] as const,
};

export const useNearbyFestivalsQuery = () =>
  useQuery<NearbyFestivalListDTO>({
    queryKey: QK.nearbyFestivals,
    queryFn: getNearbyFestivals,
    staleTime: 60_000,
  });
