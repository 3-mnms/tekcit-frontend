// src/shared/api/useTokenInfoQuery.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/config/axios'

type Role = 'USER' | 'HOST' | 'ADMIN'
export interface TokenInfo { userId: number; role: Role; name: string }

type SuccessResponse<T> = { success: boolean; data: T }

export async function getTokenInfo(): Promise<TokenInfo | null> {
  try {
    const { data } = await api.get<SuccessResponse<TokenInfo>>('/users/token/parse')
    return data?.data ?? null
  } catch {
    return null
  }
}

export function useTokenInfoQuery() {
  return useQuery({
    queryKey: ['tokenInfo'],
    queryFn: getTokenInfo,
    retry: false,
    staleTime: 0,
  })
}
