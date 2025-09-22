import { useEffect, useMemo, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getEnterStatistics, type StatisticsQrCodeResponseDTO } from '@/shared/api/my/statistics';

export const enterStatsKey = (
  festivalId?: string,
  performanceDateISO?: string
) => ['statistics', 'enter', festivalId ?? null, performanceDateISO ?? null] as const;

export type UseEnterStatisticsResult = {
  data: StatisticsQrCodeResponseDTO | undefined;
  isPending: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useEnterStatistics(
  festivalId?: string,
  performanceDateISO?: string,
  enabled: boolean = true,
  pollMs: number = 5000
): UseEnterStatisticsResult {
  const active = Boolean(enabled && festivalId && performanceDateISO);
  const qc = useQueryClient();
  const lastRef = useRef<StatisticsQrCodeResponseDTO | undefined>(undefined);

  const mutation = useMutation<StatisticsQrCodeResponseDTO, Error, void>({
    mutationFn: async () => {
      return await getEnterStatistics(festivalId as string, performanceDateISO as string);
    },
    onSuccess: (snapshot) => {
      lastRef.current = snapshot;
      qc.setQueryData<StatisticsQrCodeResponseDTO>(
        enterStatsKey(festivalId, performanceDateISO),
        snapshot
      );
    },
  });

  useEffect(() => {
    if (!active) return;
    mutation.mutate();
  }, [active, festivalId, performanceDateISO]);

  useEffect(() => {
    if (!active || pollMs <= 0) return;
    const id = window.setInterval(() => mutation.mutate(), pollMs);
    return () => window.clearInterval(id);
  }, [active, pollMs, mutation]);

  useEffect(() => {
    if (!active) return;
    const onFocus = () => mutation.mutate();
    const onVis = () => { if (!document.hidden) mutation.mutate(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [active, mutation]);

  return useMemo(
    () => ({
      data: lastRef.current,
      isPending: mutation.isPending,
      error: mutation.error ?? null,
      refetch: () => mutation.mutate(),
    }),
    [mutation.error, mutation.isPending]
  );
}
