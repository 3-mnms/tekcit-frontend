import { useQuery, useMutation } from '@tanstack/react-query';
import { getFestivalDetail, increaseFestivalViews } from '@/shared/api/festival/festivalApi';
import type { FestivalDetail, WeekKey } from '@/models/festival/festivalType';

/** "Fri" | "FRI" | "FRIDAY" → 'FRI' */
const normalizeDow = (raw?: string): WeekKey | null => {
  if (!raw) return null;
  const k = String(raw).trim().slice(0, 3).toUpperCase();
  const ok = ['SUN','MON','TUE','WED','THU','FRI','SAT'] as const;
  return (ok as readonly string[]).includes(k) ? (k as WeekKey) : null;
};

/** "H:mm" | "HH:mm" → "HH:mm" */
const normalizeHHmm = (raw?: string): string | null => {
  if (!raw) return null;
  const m = String(raw).trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = String(Math.min(23, parseInt(m[1], 10))).padStart(2, '0');
  const mm = String(Math.min(59, parseInt(m[2], 10))).padStart(2, '0');
  return `${h}:${mm}`;
};

/** daysOfWeek[i] ↔ times[i] 묶어서 {FRI:["20:00"], SAT:["17:00","12:00"], ...} 생성 */
const buildTimesByDow = (days: unknown[], times: unknown[]): Record<WeekKey, string[]> => {
  const n = Math.min(days.length, times.length);
  const out: Partial<Record<WeekKey, string[]>> = {};
  for (let i = 0; i < n; i++) {
    const dow = normalizeDow(days[i] as string);
    const hhmm = normalizeHHmm(times[i] as string);
    if (!dow || !hhmm) continue;
    (out[dow] ??= []).push(hhmm);
  }
  // 중복 제거 + 정렬
  for (const k of Object.keys(out) as WeekKey[]) {
    out[k] = Array.from(new Set(out[k]!)).sort();
  }
  return out as Record<WeekKey, string[]>;
};

export function useFestivalDetail(fid?: string) {
  return useQuery<FestivalDetail>({
    queryKey: ['festivalDetail', fid],
    queryFn: () => getFestivalDetail(fid!),
    enabled: !!fid,
    // ✅ 여기서 timesByDow 파생 생성
    select: (raw) => {
      const timesByDow = buildTimesByDow(raw.daysOfWeek ?? [], raw.times ?? []);
      return { ...raw, timesByDow };
    },
  });
}

export function useIncreaseViews() {
  return useMutation({
    mutationFn: (fid: string) => increaseFestivalViews(fid),
  });
}
