import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  apiCreateFavorite,
  apiDeleteFavorite,
  apiReadFavoriteCount,
  apiReadMyFavorites,
  apiReadMyLiked,
} from '@/shared/api/festival/favoriteApi';
import type {
  FavoriteToggleResponse,
  LikedFlagResponse,
  FavoriteCountResponse,
  MyFavoritesListResponse,
} from '@/models/festival/favoriteTypes';

// ✅ 쿼리 키 모음
export const FavoriteKeys = {
  root: ['favorite'] as const,
  isLiked: (fid: string) => [...FavoriteKeys.root, 'isLiked', fid] as const,
  count: (fid: string) => [...FavoriteKeys.root, 'count', fid] as const,
  myList: (page: number, size: number) => [...FavoriteKeys.root, 'me', page, size] as const,
};

// ── 조회 훅들 ──
export function useIsFavorite(fid?: string, enabled = true) {
  return useQuery<LikedFlagResponse>({
    queryKey: fid ? FavoriteKeys.isLiked(fid) : ['favorite','isLiked','_absent'],
    queryFn: () => apiReadMyLiked(fid!),
    enabled: Boolean(fid) && enabled,
    staleTime: 30_000,
  });
}

export function useFavoriteCount(fid?: string) {
  return useQuery<FavoriteCountResponse>({
    queryKey: fid ? FavoriteKeys.count(fid) : ['favorite','count','_absent'],
    queryFn: () => apiReadFavoriteCount(fid!),
    enabled: Boolean(fid),
    staleTime: 30_000,
  });
}

export function useMyFavorites(page = 0, size = 20) {
  return useQuery<MyFavoritesListResponse>({
    queryKey: FavoriteKeys.myList(page, size),
    queryFn: () => apiReadMyFavorites(page, size),
    keepPreviousData: true,
    staleTime: 10_000,
  });
}

// ── 변경 훅들(POST/DELETE) ──
// 토글 구조: create / delete를 분리해서 명시적으로 사용
export function useCreateFavoriteMutation(fid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiCreateFavorite(fid),
    onMutate: async () => {
      await Promise.all([
        qc.cancelQueries({ queryKey: FavoriteKeys.isLiked(fid) }),
        qc.cancelQueries({ queryKey: FavoriteKeys.count(fid) }),
      ]);

      const prevLiked = qc.getQueryData<LikedFlagResponse>(FavoriteKeys.isLiked(fid));
      const prevCount = qc.getQueryData<FavoriteCountResponse>(FavoriteKeys.count(fid));

      // 낙관적 업데이트
      qc.setQueryData<LikedFlagResponse>(FavoriteKeys.isLiked(fid), { liked: true });
      if (prevCount) {
        qc.setQueryData<FavoriteCountResponse>(FavoriteKeys.count(fid), { count: (prevCount.count ?? 0) + 1 });
      }

      return { prevLiked, prevCount };
    },
    onError: (_err, _vars, ctx) => {
      // 롤백
      if (ctx?.prevLiked) qc.setQueryData(FavoriteKeys.isLiked(fid), ctx.prevLiked);
      if (ctx?.prevCount) qc.setQueryData(FavoriteKeys.count(fid), ctx.prevCount);
    },
    onSuccess: (res) => {
      // 서버 값으로 정합성 맞추기
      qc.setQueryData<LikedFlagResponse>(FavoriteKeys.isLiked(fid), { liked: res.liked });
      qc.setQueryData<FavoriteCountResponse>(FavoriteKeys.count(fid), { count: res.count });
      // 내 목록도 무효화
      qc.invalidateQueries({ queryKey: FavoriteKeys.root });
    },
  });
}

export function useDeleteFavoriteMutation(fid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiDeleteFavorite(fid),
    onMutate: async () => {
      await Promise.all([
        qc.cancelQueries({ queryKey: FavoriteKeys.isLiked(fid) }),
        qc.cancelQueries({ queryKey: FavoriteKeys.count(fid) }),
      ]);
      const prevLiked = qc.getQueryData<LikedFlagResponse>(FavoriteKeys.isLiked(fid));
      const prevCount = qc.getQueryData<FavoriteCountResponse>(FavoriteKeys.count(fid));

      // 낙관적 업데이트
      qc.setQueryData<LikedFlagResponse>(FavoriteKeys.isLiked(fid), { liked: false });
      if (prevCount) {
        const next = Math.max(0, (prevCount.count ?? 0) - 1);
        qc.setQueryData<FavoriteCountResponse>(FavoriteKeys.count(fid), { count: next });
      }

      return { prevLiked, prevCount };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevLiked) qc.setQueryData(FavoriteKeys.isLiked(fid), ctx.prevLiked);
      if (ctx?.prevCount) qc.setQueryData(FavoriteKeys.count(fid), ctx.prevCount);
    },
    onSuccess: (res) => {
      qc.setQueryData<LikedFlagResponse>(FavoriteKeys.isLiked(fid), { liked: res.liked });
      qc.setQueryData<FavoriteCountResponse>(FavoriteKeys.count(fid), { count: res.count });
      // 내 목록 무효화 (삭제되었을 수 있으니)
      qc.invalidateQueries({ queryKey: FavoriteKeys.root });
    },
  });
}
