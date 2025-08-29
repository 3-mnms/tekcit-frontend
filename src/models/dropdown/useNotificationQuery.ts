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

const makeId = (x: NotificationListDTO, idx: number) =>
  `${x.sentAt}__${x.title}__${idx}`;

const mapToItem = (x: NotificationListDTO, idx: number): NotificationList => ({
  id: makeId(x, idx),
  title: x.title,
  message: x.fname,        // 상세 본문은 없어서 공연명으로 보조 텍스트 구성
  time: timeAgoKorean(x.sentAt),
  read: x.isRead,          // ✅ isRead → read로 변환
});

export function useHydrateNotifications(enabled = true) {
  const setFromServer = useNotificationStore((s) => s.setFromServer);

  const q = useQuery({
    queryKey: ['notifications', 'history'],
    queryFn: fetchNotificationHistory,
    enabled,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (q.data) {
      const list = q.data.map(mapToItem);
      setFromServer(list);
    }
  }, [q.data, setFromServer]);

  return q; // loading / error 상태를 컴포넌트에서 사용할 수 있게 반환
}
