import { api } from '@/shared/config/axios';
import type { BookmarkItem } from '@/models/bookmark/BookmarkItem';

type MyFavoritesDTOFromServer = {
  fid: string;
  fname: string;
  posterFile?: string | null;
};

type MyFavoritesListResponseFromServer = {
  items: MyFavoritesDTOFromServer[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type MyFavoritesListResponse = {
  items: BookmarkItem[]; 
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export const apiGetMyFavorites = async (page = 0, size = 20): Promise<MyFavoritesListResponse> => {
  const { data } = await api.get('/festival/favorites/me', { params: { page, size } });
  const raw = (data?.data ?? data) as MyFavoritesListResponseFromServer;

  return {
    ...raw,
    items: raw.items.map(({ fid, fname, posterFile }) => ({
      fid,
      name: fname,                  
      thumbnailUrl: posterFile ?? null
    })),
  };
};

export const apiCreateFavorite = async (fid: string) => {
  const { data } = await api.post(`/festival/favorites/${fid}`);
  return data?.data ?? data;
};

export const apiDeleteFavorite = async (fid: string) => {
  const { data } = await api.delete(`/festival/favorites/${fid}`);
  return data?.data ?? data;
};

export const apiIsLiked = async (fid: string): Promise<{ liked: boolean }> => {
  const { data } = await api.get(`/festival/favorites/me/${fid}`);
  return (data?.data ?? data) as { liked: boolean };
};

export const apiFavoriteCount = async (fid: string): Promise<{ count: number }> => {
  const { data } = await api.get(`/festival/favorites/${fid}/count`);
  return (data?.data ?? data) as { count: number };
};
