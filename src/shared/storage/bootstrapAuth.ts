// src/shared/storage/bootstrapAuth.ts
import { reissue, type ReissueResponseDTO } from '@/shared/api/auth/login'
import { setAuthHeaderToken } from '@/shared/config/axios'
import { useAuthStore } from '@/shared/storage/useAuthStore'

export async function bootstrapAuth() {
  try {
    const data = await reissue()
    const at = (data as ReissueResponseDTO)?.accessToken ?? null

    if (at) {
      setAuthHeaderToken(at)
      useAuthStore.getState().setAccessToken(at)

    } else {
      useAuthStore.getState().clearUser()
    }
  } catch {
    useAuthStore.getState().clearUser()
  } finally {
    useAuthStore.getState().setAuthReady(true)
  }
}
