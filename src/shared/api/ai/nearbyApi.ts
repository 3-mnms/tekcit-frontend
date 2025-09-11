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

export type SuccessResponse<T> = {
  success: boolean;
  data: T;
  message?: string | null;
};

export type ActivityType = 'Restaurant' | 'HotPlace'; // BE enum 설명에 맞춤

export type ActivityDTO = {
  activityName: string;
  addressName: string;
  latitude: number;
  longitude: number;
  activityType: ActivityType;
};

export type CourseDTO = {
  course1: string | null;
  course2: string | null;
  course3: string | null;
};

export type RecommendDTO = {
  festivalDetailId: string;              // 대상 페스티벌 id
  restaurants: ActivityDTO[];            // 3개
  hotPlaces: ActivityDTO[];              // 3개
  courseDTO: CourseDTO | null;           // 코스(문자 3단)
};

export async function getNearbyFestivals(): Promise<NearbyFestivalListDTO> {
  const { data } = await api.get('/festival/nearby/festivalList');
  // 백엔드 공통 래핑(SuccessResponse) 대비
  const payload = data?.data ?? data;
  return payload as NearbyFestivalListDTO;
}

export async function apiGetNearbyActivities() {
  const { data } = await api.get<SuccessResponse<RecommendDTO[]>>(
    '/festival/nearby/activities'
  );
  return data.data ?? [];
}