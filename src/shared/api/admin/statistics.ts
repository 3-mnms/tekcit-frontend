import type { BookingStatsResponse, EntranceStatsResponse, UserStatsResponse } from "@/models/admin/statistics";
import { api } from "@/shared/config/axios";

export const getFestivalSchedules = async (fid: string): Promise<{ data: string[] }> => {
  const response = await api.get<{ data: string[] }>(`/statistics/schedules/${fid}`);
  return response.data;
};

export const getBookingStatsData = async (fid: string): Promise<BookingStatsResponse> => {
  const response = await api.get<BookingStatsResponse>(`/statistics/booking/${fid}`);
  return response.data;
};

export const getUserStatsData = async (fid: string): Promise<UserStatsResponse> => {
  const response = await api.get<UserStatsResponse>(`/statistics/users/${fid}`);
  return response.data;
};

export const getEntranceCount = async (festivalId: string, performanceDate: string): Promise<EntranceStatsResponse> => {
    const response = await api.get<EntranceStatsResponse>(`/statistics/enter/${festivalId}`, {
        params: {
            performanceDate: performanceDate
        }
    });
    return response.data;
};