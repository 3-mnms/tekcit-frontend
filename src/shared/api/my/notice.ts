// src/shared/api/notification/notificationApi.ts
import { api } from '@/shared/config/axios';

export type NotificationListDTO = {
  nid: number;
  title: string;
  sentAt: string; 
  fname: string;
  isRead: boolean;
};

export type NotificationResponseDTO = {
  nid: number;
  title: string;
  body: string;
  sentAt: string; // ISO
  isRead: boolean;
  fname: string;
};


type SuccessEnvelope<T> = { success: true; data: T; message?: string };
type ApiResponse<T> = SuccessEnvelope<T> | T;

function unwrap<T>(res: ApiResponse<T>): T {
  if (res && typeof res === 'object' && 'success' in (res as any)) {
    const env = res as SuccessEnvelope<T>;
    if (env.success) return env.data;
  }
  return res as T;
}

export async function fetchNotificationHistory(): Promise<NotificationListDTO[]> {
  const { data } = await api.get('/users/notice/history');
  return unwrap<NotificationListDTO[]>(data);
}
