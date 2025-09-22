// src/models/dropdown/NotificationStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface NotificationList {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationStore {
  notifications: NotificationList[];
  readIds: Record<number, true>;               // ✅ 읽은 nid를 영구 저장
  isDropdownOpen: boolean;
  toggleDropdown: () => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  unreadCount: () => number;
  setFromServer: (list: NotificationList[]) => void;
  clearLocalRead: () => void;                   // (옵션) 로그아웃 시 초기화용
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      readIds: {},                               // ✅ 초기값

      isDropdownOpen: false,
      toggleDropdown: () => set(s => ({ isDropdownOpen: !s.isDropdownOpen })),

      // 서버 목록 + 로컬 읽음 기록을 OR로 합치기
      setFromServer: (list) =>
        set((state) => ({
          notifications: list.map(n => ({
            ...n,
            read: n.read || !!state.readIds[n.id],
          })),
        })),

      // 상세 진입 시 로컬에도 기록
      markAsRead: (id) =>
        set((state) => ({
          readIds: { ...state.readIds, [id]: true },
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllAsRead: () =>
        set((state) => {
          const next = { ...state.readIds };
          state.notifications.forEach(n => { next[n.id] = true; });
          return {
            readIds: next,
            notifications: state.notifications.map(n => ({ ...n, read: true })),
          };
        }),

      unreadCount: () => get().notifications.filter(n => !n.read).length,

      clearLocalRead: () => set({ readIds: {} }),
    }),
    {
      name: 'notification-read',                         // ✅ localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ readIds: s.readIds }),       // ✅ readIds만 저장
    }
  )
);
