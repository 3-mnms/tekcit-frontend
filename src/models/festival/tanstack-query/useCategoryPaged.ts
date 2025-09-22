// src/models/festival/tanstack-query/useCategoryPaged.ts
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { getFestivalsByCategory, type PageResp } from '@/shared/api/festival/festivalApi'
import type { Festival } from '@/models/festival/festivalType'

export function useCategoryPaged(genrenm?: string, size = 15, opt?: { enabled?: boolean }) {
  return useInfiniteQuery<PageResp<Festival>>({
    queryKey: ['categoryPaged', genrenm, size],
    enabled: (opt?.enabled ?? true) && !!genrenm,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      getFestivalsByCategory(genrenm!, pageParam as number, size, signal),
    getNextPageParam: (last) => (last.last ? undefined : last.number + 1),
  })
}

export function useHotByGenrenm(genrenm?: string, size = 10, opt?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['hotByGenrenm', genrenm, size],
    enabled: (opt?.enabled ?? true) && !!genrenm,
    queryFn: ({ signal }) =>
      getFestivalsByCategory(genrenm!, 0, size, signal).then(r => r.content),
    staleTime: 60_000,
  })
}