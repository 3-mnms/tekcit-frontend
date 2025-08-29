import { useMemo } from 'react'
import { useAuthStore } from '@/shared/storage/useAuthStore'

export function useAuth() {
  const { user } = useAuthStore()
  return useMemo(() => ({
    name:  user?.name     ?? '',
    role:  user?.role     ?? 'USER',
  }), [user])
}