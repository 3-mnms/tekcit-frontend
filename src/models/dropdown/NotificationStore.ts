// src/models/dropdown/NotificationStore.ts
import { create } from 'zustand';
import type { NotificationItem } from '@/models/dropdown/NotificationItem';

interface NotificationStore {
  notifications: NotificationItem[];
  isDropdownOpen: boolean;
  toggleDropdown: () => void;
  markAsRead: (id: number | string) => void;
  markAllAsRead: () => void;
  unreadCount: () => number;
  setFromServer: (list: NotificationItem[]) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  isDropdownOpen: false,

  toggleDropdown: () =>
    set((s) => ({ isDropdownOpen: !s.isDropdownOpen })),

  markAsRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllAsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),

  unreadCount: () => get().notifications.filter((n) => !n.read).length,

  setFromServer: (list) => set({ notifications: list }),
}));

export interface NotificationList {
  id: number | string;
  title: string;
  message: string; 
  time: string;   
  read: boolean;
}
