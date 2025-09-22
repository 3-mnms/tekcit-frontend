import { useQuery } from '@tanstack/react-query'
import { getFestivals } from '@/shared/api/festival/festivalApi'
import type { Festival } from '@/models/festival/festivalType'

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
