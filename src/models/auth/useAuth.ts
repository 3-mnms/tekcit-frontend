import { useMemo } from 'react'
import { useAuthStore } from '@/shared/storage/useAuthStore'

export function useAuth() {
  const { user } = useAuthStore()
  return useMemo(() => ({
    name:  user?.name     ?? '',
    email: user?.loginId  ?? '',
    role:  user?.role     ?? 'USER',
  }), [user])
}