// src/shared/storage/useAuthStore.ts
import { create } from 'zustand';

interface AuthUser {
  role: 'user' | 'host' | 'admin';
  name: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: AuthUser | null;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  user: null,
  setUser: (user) => set({ isLoggedIn: true, user }),
  clearUser: () => set({ isLoggedIn: false, user: null }),

  getRole: () => get().user?.role,
  getName: () => get().user?.name,
}));
