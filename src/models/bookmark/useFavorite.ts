import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  apiGetMyFavorites,
  apiDeleteFavorite,
  apiCreateFavorite,
  type MyFavoritesListResponse,
} from '@/shared/api/my/favorite';

export const qk = {
  myFavorites: ['favorite', 'me'] as const,
};

// 내 즐겨찾기 목록 (무한스크롤/더보기)
export const useMyFavoritesInfinite = (size = 20) =>
  useInfiniteQuery<MyFavoritesListResponse>({
    queryKey: qk.myFavorites,
    queryFn: ({ pageParam = 0 }) => apiGetMyFavorites(pageParam, size),
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.page + 1),
    initialPageParam: 0,
  });

// 토글(추가/삭제) - 목록 페이지에서는 보통 '삭제'만 사용
export const useFavoriteToggle = () => {
  const qc = useQueryClient();

  const add = useMutation({
    mutationFn: (fid: string) => apiCreateFavorite(fid),
    onSuccess: () => {
      // 새로 추가되었을 수 있으니 목록 새로고침
      qc.invalidateQueries({ queryKey: qk.myFavorites });
    },
  });

  const remove = useMutation({
    mutationFn: (fid: string) => apiDeleteFavorite(fid),
    // ✅ 낙관적 업데이트로 리스트에서 즉시 제거
    onMutate: async (fid) => {
      await qc.cancelQueries({ queryKey: qk.myFavorites });
      const prev = qc.getQueryData<ReturnType<typeof useMyFavoritesInfinite>['_def']['meta']>(qk.myFavorites as any);

      const pages = qc.getQueryData<any>(qk.myFavorites)?.pages as MyFavoritesListResponse[] | undefined;
      if (pages) {
        const newPages = pages.map(p => ({ ...p, items: p.items.filter(it => it.fid !== fid) }));
        qc.setQueryData(qk.myFavorites, { pages: newPages, pageParams: qc.getQueryData<any>(qk.myFavorites)?.pageParams ?? [] });
      }
      return { prev };
    },
    onError: (_err, _fid, ctx) => {
      // 롤백
      if (ctx?.prev) qc.setQueryData(qk.myFavorites, ctx.prev as any);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.myFavorites });
    },
  });

  return { add, remove };
};
