// src/models/festivald/tanstack-query/useUserAge.ts
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/storage/useAuthStore';
import { checkUserAge } from '@/shared/api/festival/userApi'; // ✅ 사용자가 만든 경로 기준
import type { UserAge } from '@/models/festival/userAgeTypes';

export const festivaldKeys = {
  userAge: ['festivald', 'user', 'age'] as const,
} as const;

/** 자정까지 남은 시간(ms) — 나이는 자정 전엔 변하지 않으므로 캐싱에 유리 */
function msUntilTomorrow(): number {
  const now = new Date();
  const tmr = new Date(now);
  tmr.setDate(now.getDate() + 1);
  tmr.setHours(0, 0, 0, 0);
  return Math.max(tmr.getTime() - now.getTime(), 60_000); // 최소 1분
}

/**
 * 사용자 나이 조회 훅
 * - 기본은 토큰이 있을 때만(enabled) 자동 조회
 * - 버튼 클릭 시에만 필요하다면 enabled:false로 두고 refetch()로 호출
 */
export function useUserAgeQuery(opts?: { enabled?: boolean }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const enabled = (opts?.enabled ?? true) && !!accessToken;

  return useQuery<UserAge>({
    queryKey: festivaldKeys.userAge,
    queryFn: checkUserAge,          // GET /api/users/checkAge → number(만 나이)
    enabled,
    staleTime: msUntilTomorrow(),   // 자정까지 신선
    gcTime: 24 * 60 * 60 * 1000,    // 하루 캐시
    retry: 1,
  });
}
