import type { Announcement } from '@/models/admin/Announcement';
import { api } from '@/shared/config/axios';

// 삐약! 서버 응답 전체의 모양을 타입으로 정의
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const getAnnouncements = async (): Promise<Announcement[]> => {
  const response = await api.get<ApiResponse<Announcement[]>>('/users/notice');
  
  return response.data.data || [];
};

export const createAnnouncement = async (newAnnouncement: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> => {
    const response = await api.post<ApiResponse<Announcement>>('/api/admin/announcements', newAnnouncement);
    return response.data.data;
};

export const updateAnnouncement = async (updatedAnnouncement: Announcement): Promise<Announcement> => {
    const { scheduleId, ...dataToUpdate } = updatedAnnouncement;
    const response = await api.put<ApiResponse<Announcement>>(`/api/admin/announcements/${scheduleId}`, dataToUpdate);
    return response.data.data;
};

export const deleteAnnouncement = async (announcementId: number): Promise<void> => {
    await api.delete(`/api/admin/announcements/${announcementId}`);
};