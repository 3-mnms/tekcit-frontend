
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchFestivalUserStatistics } from '@/shared/api/statistics/statisticsApi';
import type { StatisticsUser } from '@/models/statistics/statisticsTypes';

type Options = { enabled?: boolean };

export function useFestivalUserStatistics(
  festivalId: string,
  options?: Options
) {
  return useQuery<StatisticsUser>({
    queryKey: ['statistics', 'users', festivalId],
    queryFn: () => fetchFestivalUserStatistics(festivalId),
    enabled: !!festivalId && (options?.enabled ?? true),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}
