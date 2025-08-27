// src/shared/storage/useAuthStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { parseJwt, type JwtRole, type JwtPayloadBase } from '@/shared/storage/jwt'

/** ---------- Types ---------- */
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
  /** UI용 상태 */
  authReady: boolean
  isLoggedIn: boolean

  /** 인증 데이터 */
  accessToken: string | null
  user: User | null

  /** actions */
  setAuthReady: (v: boolean) => void
  setAccessToken: (token: string | null) => void
  setUserFromToken: (token: string | null) => void
  setUser: (user: User | null) => void
  logout: () => void
  clearUser: () => void
}

/** ---------- Store ---------- */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      /** 기본 상태 */
      authReady: false,
      isLoggedIn: false,
      accessToken: null,
      user: null,

      /** UI 게이트 컨트롤 */
      setAuthReady: (v) => set({ authReady: v }),

      /** 토큰 세팅 시 자동으로 유저도 파싱 */
      setAccessToken: (token) => {
        set({ accessToken: token })
        get().setUserFromToken(token)
      },

      /** JWT 파싱해서 user 세팅 */
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

      /** 직접 유저를 세팅해야 할 일이 있을 때 */
      setUser: (user) => set({ user, isLoggedIn: !!user }),

      /** 로그아웃 (클라이언트 측 정리) */
      logout: () => {
        set({ accessToken: null, user: null, isLoggedIn: false })
      },

      /** 서버/클라 모두 끊어야 할 때 동일하게 사용 가능 */
      clearUser: () => {
        set({ accessToken: null, user: null, isLoggedIn: false })
      },
    }),
    {
      /** ---- persist 옵션 ---- */
      name: 'auth', // storage key
      getStorage: () => sessionStorage, // 새로고침 유지, 브라우저 종료 시 삭제 (보안상 localStorage보다 권장)
      /**
       * 보안/개인정보 최소화: accessToken만 영속화
       * user는 토큰으로 항상 복원 가능하므로 저장 안 함
       */
      partialize: (s) => ({ accessToken: s.accessToken }),

      /**
       * hydration 훅: 스토리지에서 복원된 직후에
       * - 토큰으로 user 파싱
       * - authReady true로 전환 (라우터 가드 등에서 사용)
       */
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          // 복원 실패 시 비로그인 상태로 시작
          return
        }
        if (!state) return
        try {
          const token = state.accessToken
          state.setUserFromToken(token)
        } finally {
          state.setAuthReady(true)
        }
      },
    }
  )
)
