// 근처 페스티벌 조회 API
import { api } from '@/shared/config/axios';

export type NearbyFestivalDTO = {
  festivalId?: number | string;
  id?: number | string;
  title?: string;
  festivalName?: string;
  venue?: string;
  hallName?: string;
  address?: string;
  distance?: number;
  distanceKm?: number;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  posterUrl?: string;
  posterFile?: string;
};

export type UserGeocodeInfoDTO = {
  userId: number;
  latitude: number | null;
  longitude: number | null;
};

export type NearbyFestivalListDTO = {
  userGeocodeInfo: UserGeocodeInfoDTO;
  festivalList: NearbyFestivalDTO[];
};

export async function getNearbyFestivals(): Promise<NearbyFestivalListDTO> {
  const { data } = await api.get('/festival/nearby/festivalList');
  // 백엔드 공통 래핑(SuccessResponse) 대비
  const payload = data?.data ?? data;
  return payload as NearbyFestivalListDTO;
}
