// src/shared/api/payment/tekcitHistory.ts - 수정된 버전
import { api } from '@/shared/config/axios'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'

const Envelope = <T extends z.ZodTypeAny>(data: T) =>
  z.object({ success: z.boolean(), data: data.nullable(), message: z.string().optional() })

const BalanceData = z.object({
  availableBalance: z.number().int().nonnegative(),
  updatedAt: z.string(),
})
export type TekcitBalance = z.infer<typeof BalanceData>

// 백엔드 실제 응답에 맞는 정확한 스키마
const RawHistoryItem = z.object({
  paymentId: z.string(),                    // required
  amount: z.number().int(),                 // required
  currency: z.string(),                     // required
  payMethod: z.string(),                    // required ("POINT_PAYMENT")
  payTime: z.string(),                      // required (ISO string)
  paymentStatus: z.string(),                // required ("PAID")
  transactionType: z.string(),              // required ("CREDIT", "DEBIT", "UNKNOWN")
  buyerId: z.number().int().nullable(),     // nullable! 중요함
})

const SpringPageRaw = z.object({
  totalElements: z.number().int(),
  totalPages: z.number().int(),
  first: z.boolean(),
  size: z.number().int(),
  content: z.array(RawHistoryItem),
  number: z.number().int(),
  sort: z.any().optional(),
  numberOfElements: z.number().int(),
  pageable: z.any().optional(),
  last: z.boolean(),
  empty: z.boolean(),
})

// 정규화된 타입
export type WalletHistoryItem = { 
  paymentId: string
  amount: number
  method: string                            // payMethod -> method
  time: string                              // payTime -> time
  transactionType: 'CREDIT' | 'DEBIT' | 'UNKNOWN'
  paymentStatus: string
  buyerId: number | null
}

export type WalletHistoryPage = Omit<z.infer<typeof SpringPageRaw>, 'content'> & { 
  content: WalletHistoryItem[] 
}

function normalizePage(raw: z.infer<typeof SpringPageRaw>): WalletHistoryPage {
  return {
    ...raw,
    content: raw.content.map((r) => ({
      paymentId: r.paymentId,
      amount: r.amount,
      method: r.payMethod,                  // payMethod -> method
      time: r.payTime,                      // payTime -> time
      transactionType: r.transactionType as 'CREDIT' | 'DEBIT' | 'UNKNOWN',
      paymentStatus: r.paymentStatus,
      buyerId: r.buyerId,
    })),
  }
}

export async function fetchTekcitBalance(): Promise<TekcitBalance> {
  const { data } = await api.get('/tekcitpay')
  const parsed = Envelope(BalanceData).parse(data)
  if (!parsed.data) throw new Error('잔액 응답에 data가 없습니다.')
  return parsed.data
}

export async function fetchTekcitHistory(params: { page?: number; size?: number }): Promise<WalletHistoryPage> {
  const page = params?.page ?? 0
  const size = Math.max(1, params?.size ?? 10)
  
  try {
    const { data } = await api.get('/tekcitpay/history', { params: { page, size } })
    
    
    const parsed = Envelope(SpringPageRaw).safeParse(data)
    if (!parsed.success) {
      console.error('Schema validation failed:', parsed.error)
      console.error('Raw data:', data)
      throw new Error('API 응답 형식이 올바르지 않습니다.')
    }
    
    if (!parsed.data.data) {
      console.warn('API returned null data')
      return {
        totalElements: 0,
        totalPages: 0,
        first: true,
        size,
        content: [],
        number: page,
        numberOfElements: 0,
        last: true,
        empty: true,
      }
    }
    
    return normalizePage(parsed.data.data)
  } catch (error) {
    console.error('fetchTekcitHistory error:', error)
    throw error
  }
}

export const WalletQueryKeys = {
  balance: ['wallet', 'balance'] as const,
  history: (page: number, size: number) => ['wallet', 'history', page, size] as const,
}

export function useWalletBalance() {
  return useQuery<TekcitBalance>({
    queryKey: WalletQueryKeys.balance,
    queryFn: fetchTekcitBalance,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

export function useWalletHistory(opts: { page: number; size: number }) {
  const { page, size } = opts
  return useQuery<WalletHistoryPage>({
    queryKey: WalletQueryKeys.history(page, size),
    queryFn: () => fetchTekcitHistory({ page, size }),
    keepPreviousData: true,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 10_000,
  })
}

export async function getWalletBalance(): Promise<number> {
  const b = await fetchTekcitBalance()
  return b.availableBalance
}