// shared/storage/useAuthStore.ts
import { create } from 'zustand';
import { tokenStore } from '@/shared/storage/tokenStore';
import { parseJwt } from './jwt';

interface User {
  userId: number;
  role: 'USER' | 'HOST' | 'ADMIN';
  name: string;
  loginId: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const token = tokenStore.get();
  let user: User | null = null;

  if (token) {
    const decoded = parseJwt(token);
    if (decoded) {
      user = {
        userId: decoded.userId,
        role: decoded.role,
        name: decoded.name,
        loginId: decoded.sub,
      };
    }
  }

  return {
    isLoggedIn: !!user,
    user,
    setUser: (user) => set({ user, isLoggedIn: !!user }),
    logout: () => {
      tokenStore.clear();
      set({ isLoggedIn: false, user: null });
    },
    clearUser: () => set({ isLoggedIn: false, user: null }),
  };
});
