// src/shared/api/my/notice.ts
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

const unwrap = <T,>(res: ApiResponse<T>): T =>
  (res && typeof res === 'object' && 'success' in (res as any))
    ? (res as SuccessEnvelope<T>).data
    : (res as T);

export async function fetchNotificationHistory(): Promise<NotificationListDTO[]> {
  const { data } = await api.get('/users/notice/history');
  return unwrap<NotificationListDTO[]>(data);
}

export async function fetchNotificationDetail(nid: number): Promise<NotificationResponseDTO> {
  if (!Number.isFinite(nid)) {
    throw new Error('fetchNotificationDetail: invalid nid'); // ✅ 잘못된 호출 방지
  }
  const { data } = await api.get(`/users/notice/history/${nid}`);
  return unwrap<NotificationResponseDTO>(data);
}