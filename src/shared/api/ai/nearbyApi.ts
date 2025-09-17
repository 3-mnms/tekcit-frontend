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

type RawActivityDTO = {
  activity_name: string;
  address_name: string;
  latitude: number;
  longitude: number;
  activity_type: ActivityType;
};

function normalizeActivity(raw: RawActivityDTO): ActivityDTO {
  return {
    activityName: raw.activity_name,
    addressName: raw.address_name,
    latitude: raw.latitude,
    longitude: raw.longitude,
    activityType: raw.activity_type,
  };
}

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
  course4: string | null;
  course5: string | null;
};

type RawRecommendDTO = {
  festivalDetailId: string;
  restaurants: RawActivityDTO[];
  hotPlaces: RawActivityDTO[];
  courseDTO: CourseDTO | null;
};

export type RecommendDTO = {
  festivalDetailId: string;            
  restaurants: ActivityDTO[];           
  hotPlaces: ActivityDTO[];             
  courseDTO: CourseDTO | null;          
};

export async function getNearbyFestivals(): Promise<NearbyFestivalListDTO> {
  const { data } = await api.get('/festival/nearby/festivalList');
  // 백엔드 공통 래핑(SuccessResponse) 대비
  const payload = data?.data ?? data;
  return payload as NearbyFestivalListDTO;
}

export async function apiGetNearbyActivities(): Promise<RecommendDTO[]> {
  const { data } = await api.get<SuccessResponse<RawRecommendDTO[]>>(
    '/festival/nearby/activities'
  );

  const rows = data.data ?? [];

  return rows.map((r) => ({
    festivalDetailId: r.festivalDetailId, 
    restaurants: (r.restaurants ?? []).map(normalizeActivity),
    hotPlaces: (r.hotPlaces ?? []).map(normalizeActivity),
    courseDTO: r.courseDTO ?? null,
  }));
}