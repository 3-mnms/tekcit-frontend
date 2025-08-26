import { useQuery } from '@tanstack/react-query';
import { getPreReservation } from '@/shared/api/booking/ruserApi';
import type { PreReservationDTO, ApiSuccessResponse } from '@/models/booking/ruserType';

export const preReservationKeys = {
  all: ['users', 'preReservation'] as const,
};

export function usePreReservation(enabled = true) {
  return useQuery({
    queryKey: preReservationKeys.all,
    queryFn: async (): Promise<PreReservationDTO> => {
      const res: ApiSuccessResponse<PreReservationDTO> = await getPreReservation();
      return res.data;
    },
    enabled,
    staleTime: 60_000,   // 1분
    gcTime: 5 * 60_000,  // 5분
    retry: (failureCount, err: any) => {
      // 401/403이면 재시도 X
      const status = err?.response?.status;
      if (status === 401 || status === 403) return false;
      return failureCount < 2;
    },
  });
}
