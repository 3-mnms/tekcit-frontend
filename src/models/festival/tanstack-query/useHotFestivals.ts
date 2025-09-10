import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getFestivals } from '@/shared/api/festival/festivalApi'
import type { Festival } from '@/models/festival/festivalType'

const CATEGORY_MAP: Record<string, string> = {
  '대중무용': '무용',
  '무용(서양/한국무용)': '무용',
  '대중음악': '대중음악',
  '뮤지컬': '뮤지컬/연극',
  '연극': '뮤지컬/연극',
  '서양음악(클래식)': '클래식/국악',
  '한국음악(국악)': '클래식/국악',
  '서커스/마술': '서커스/마술',
}
const normalizeCategory = (o?: string) => (o ? (CATEGORY_MAP[o] ?? '복합') : '복합')

export function useHotFestivals(selectedCategory?: string | null, limit = 10) {
  return useQuery({
    queryKey: ['hotFestivals'],            // 캐시 키
    queryFn: getFestivals,                 // 실제 호출
    staleTime: 1000 * 60 * 5,              // 5분 동안 재요청 안 함
    gcTime: 1000 * 60 * 30,                // 30분 캐시 유지
    placeholderData: keepPreviousData,     // 재렌더 시 깜빡임 최소화
    select: (list: Festival[]) => {
      const base = selectedCategory
        ? list.filter((f) => normalizeCategory((f as any).genrenm) === selectedCategory)
        : list
      return base.slice(0, limit)
    },
  })
}
