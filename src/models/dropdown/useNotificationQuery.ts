// src/models/dropdown/useNotificationQuery.ts
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchNotificationHistory, type NotificationListDTO } from '@/shared/api/my/notice';
import { useNotificationStore, type NotificationList } from '@/models/dropdown/NotificationStore';

export function timeAgoKorean(iso: string): string {
  const now = new Date();
  const t = new Date(iso);
  const diff = Math.max(0, now.getTime() - t.getTime());

  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금 전';
  if (m < 60) return `${m}분전`;

  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간전`;

  const d = Math.floor(h / 24);
  return `${d}일전`;
}

const mapToItem = (x: NotificationListDTO): NotificationList => ({
  id: x.nid,
  title: x.title,
  message: x.fname,
  time: timeAgoKorean(x.sentAt),
  read: x.isRead,
});

export function useHydrateNotifications(enabled = true) {
  const setFromServer = useNotificationStore(s => s.setFromServer);
  const q = useQuery({ queryKey: ['notifications','history'], queryFn: fetchNotificationHistory, enabled, staleTime: 60_000 });

  useEffect(() => {
    if (q.data) setFromServer(q.data.map(mapToItem));    // ✅ 스토어가 readIds와 합칩
  }, [q.data, setFromServer]);

  return q;
}