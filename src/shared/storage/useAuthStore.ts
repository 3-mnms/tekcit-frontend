// src/shared/storage/useAuthStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { parseJwt, type JwtRole, type JwtPayloadBase } from '@/shared/storage/jwt'
import { AUTH_TOKEN_EVENT, setAuthHeaderToken, clearAuthHeaderToken } from '@/shared/config/axios'

export interface User {
  userId: number
  role: 'USER' | 'HOST' | 'ADMIN'
  name: string
  loginId: string
}

type AuthPayload = JwtPayloadBase & {
  userId: number
  role: JwtRole
  name: string
}

interface AuthState {
  authReady: boolean
  isLoggedIn: boolean
  accessToken: string | null
  user: User | null
  setAuthReady: (v: boolean) => void
  setAccessToken: (token: string | null) => void
  setUserFromToken: (token: string | null) => void
  setUser: (user: User | null) => void
  logout: () => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      authReady: false,
      isLoggedIn: false,
      accessToken: null,
      user: null,

      setAuthReady: (v) => set({ authReady: v }),

      setAccessToken: (token) => {
        setAuthHeaderToken(token ?? null)
        set({ accessToken: token ?? null })
        get().setUserFromToken(token)
      },

      setUserFromToken: (token) => {
        if (!token) {
          set({ user: null, isLoggedIn: false })
          return
        }
        const decoded = parseJwt<AuthPayload>(token)
        if (!decoded) {
          set({ user: null, isLoggedIn: false })
          return
        }
        const user: User = {
          userId: decoded.userId,
          role: decoded.role,
          name: decoded.name,
          loginId: decoded.sub,
        }
        set({ user, isLoggedIn: true })
      },

      setUser: (user) => set({ user, isLoggedIn: !!user }),

      logout: () => {
        clearAuthHeaderToken()
        set({ accessToken: null, user: null, isLoggedIn: false })
      },

      clearUser: () => {
        clearAuthHeaderToken()
        set({ accessToken: null, user: null, isLoggedIn: false })
      },
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: () => ({}),

      onRehydrateStorage: () => (state, error) => {
        if (error || !state) return
        try {
          window.addEventListener(AUTH_TOKEN_EVENT, (ev: Event) => {
            const token = (ev as CustomEvent<string | null>).detail ?? null
            state.accessToken = token
            state.setUserFromToken(token)
          })
        } finally {
          state.setAuthReady(true)
        }
      },
    }
  )
)
