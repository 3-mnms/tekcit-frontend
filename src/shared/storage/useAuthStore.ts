import { create } from 'zustand'
import { parseJwt, type JwtRole, type JwtPayloadBase } from '@/shared/storage/jwt'

interface User {
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
  isLoggedIn: boolean
  accessToken: string | null
  user: User | null

  // 토큰/유저 세터
  setAccessToken: (token: string | null) => void
  setUserFromToken: (token: string | null) => void
  setUser: (user: User | null) => void

  // 로그아웃/초기화
  logout: () => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  accessToken: null,
  user: null,

  setAccessToken: (token) => {
    set({ accessToken: token })
    // 토큰이 들어오면 자동으로 유저 파싱
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
    set({ accessToken: null, user: null, isLoggedIn: false })
  },

  clearUser: () => set({ accessToken: null, user: null, isLoggedIn: false }),
}))
