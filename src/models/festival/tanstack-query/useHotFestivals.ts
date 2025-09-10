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

export function useHotFestivals(_category: string | null, size = 10, opt?: { enabled?: boolean }) {
  return useQuery<Festival[]>({
    queryKey: ['hotAll', size],
    enabled: opt?.enabled ?? true,
    queryFn: async ({ signal }) => {
      const list = await getFestivals({ signal });  
      return list.slice(0, size);                 
    },
    staleTime: 60_000,
  })
}
