import { api } from '@/shared/config/axios';
import type {
  FavoriteToggleResponse,
  LikedFlagResponse,
  FavoriteCountResponse,
  MyFavoritesListResponse,
} from '@/models/festival/favoriteTypes';

type Ok<T>  = { success: true; data: T; message?: string };
type Err    = { success: false; errorCode?: string; errorMessage?: string; message?: string };
type ApiEnvelope<T> = Ok<T> | Err;
type ApiResponse<T> = ApiEnvelope<T> | T;

/** 공통 언래핑: 성공 래핑/비래핑 모두 대응 */
function unwrap<T>(payload: ApiResponse<T>): T {
  if (payload && typeof payload === 'object' && 'success' in (payload as any)) {
    const p = payload as ApiEnvelope<T>;
    if (p.success === true) {
      if ((p as Ok<T>).data !== undefined && (p as Ok<T>).data !== null) return (p as Ok<T>).data;
      throw new Error('Empty response data');
    }
    throw new Error(
      (p as Err).errorMessage ||
      (p as Err).message ||
      (p as Err).errorCode ||
      'Request failed'
    );
  }
  return payload as T;
}

export async function apiCreateFavorite(fid: string): Promise<FavoriteToggleResponse> {
  const { data } = await api.post<ApiResponse<FavoriteToggleResponse>>(`/festival/favorites/${fid}`);
  return unwrap(data);
}

export async function apiDeleteFavorite(fid: string): Promise<FavoriteToggleResponse> {
  const { data } = await api.delete<ApiResponse<FavoriteToggleResponse>>(`/festival/favorites/${fid}`);
  return unwrap(data);
}

export async function apiReadMyLiked(fid: string): Promise<LikedFlagResponse> {
  const { data } = await api.get<ApiResponse<LikedFlagResponse>>(`/festival/favorites/me/${fid}`);
  return unwrap(data);
}

export async function apiReadFavoriteCount(fid: string): Promise<FavoriteCountResponse> {
  const { data } = await api.get<ApiResponse<FavoriteCountResponse>>(`/festival/favorites/${fid}/count`);
  return unwrap(data);
}

/** 내 관심 상품 목록 */
export async function apiReadMyFavorites(page = 0, size = 20): Promise<MyFavoritesListResponse> {
  const { data } = await api.get<ApiResponse<MyFavoritesListResponse>>(
    `/festival/favorites/me`,
    { params: { page, size } }
  );
  return unwrap(data);
}
