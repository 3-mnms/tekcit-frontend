import { create } from 'zustand';
import type { NotificationItem } from '@/models/dropdown/NotificationItem';

interface NotificationStore {
  notifications: NotificationItem[];
  isDropdownOpen: boolean;
  toggleDropdown: () => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [
    {
      id: 1,
      title: '< 공연 이름 >',
      message: '공지 내용',
      time: '1분전',
      read: false,
    },
    {
      id: 2,
      title: '< 공연 이름 >',
      message: '공지 내용',
      time: '1일전',
      read: true,
    },
    {
      id: 3,
      title: '< 공연 이름 >',
      message: '공지 내용',
      time: '2일전',
      read: false,
    },
  ],
  isDropdownOpen: false,

  toggleDropdown: () =>
    set((state) => ({ isDropdownOpen: !state.isDropdownOpen })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  unreadCount: () =>
    get().notifications.filter((n) => !n.read).length,
}));
