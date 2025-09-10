// src/models/festival/tanstack-query/useCategoryPaged.ts
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { getFestivalsByGenrenm, type PageResp } from '@/shared/api/festival/festivalApi'
import type { Festival } from '@/models/festival/festivalType'

export function useCategoryPaged(genrenm?: string, size = 15, opt?: { enabled?: boolean }) {
  return useInfiniteQuery<PageResp<Festival>>({
    queryKey: ['categoryPaged', genrenm, size],
    enabled: (opt?.enabled ?? true) && !!genrenm,   // ✅ 조건부 실행
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      getFestivalsByGenrenm(genrenm!, pageParam as number, size, signal),
    getNextPageParam: (last) => (last.last ? undefined : last.number + 1),
  })
}

// 상단 HOT(카테고리 페이지용)
export function useHotByGenrenm(genrenm?: string, size = 10, opt?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['hotByGenrenm', genrenm, size],
    enabled: (opt?.enabled ?? true) && !!genrenm,   // ✅ 조건부 실행
    queryFn: ({ signal }) =>
      getFestivalsByGenrenm(genrenm!, 0, size, signal).then(r => r.content),
    staleTime: 60_000,
  })
}