// 주석: 테킷페이 잔액/내역 조회 + React Query 훅 멍
import { api } from '@/shared/config/axios'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'

/* ───────── Envelope/Schema ───────── */
const Envelope = <T extends z.ZodTypeAny>(data: T) =>
  z.object({ success: z.boolean(), data: data.nullable(), message: z.string().optional() })

const BalanceData = z.object({
  availableBalance: z.number().int().nonnegative(),
  updatedAt: z.string(),
})
export type TekcitBalance = z.infer<typeof BalanceData>

const RawHistoryItem = z.object({
  paymentId: z.string().optional(),
  amount: z.number().int(),
  currency: z.string().optional(),
  payMethod: z.string().optional(),
  method: z.string().optional(),
  type: z.string().optional(),
  payTime: z.string().optional(),
  createdAt: z.string().optional(),
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
export type WalletHistoryItem = { paymentId?: string; amount: number; method?: string; time: string }
export type WalletHistoryPage = Omit<z.infer<typeof SpringPageRaw>, 'content'> & { content: WalletHistoryItem[] }

/* ───────── Normalizer ───────── */
function normalizePage(raw: z.infer<typeof SpringPageRaw>): WalletHistoryPage {
  return {
    ...raw,
    content: raw.content.map((r) => ({
      paymentId: r.paymentId,
      amount: r.amount,
      method: r.payMethod ?? r.method ?? r.type,
      time: r.payTime ?? r.createdAt ?? new Date().toISOString(),
    })),
  }
}

/* ───────── API ───────── */
// 주석: ✅ 헤더 직접 세팅 제거 — 인터셉터가 자동 주입 멍
export async function fetchTekcitBalance(): Promise<TekcitBalance> {
  const { data } = await api.get('/tekcitpay')
  const parsed = Envelope(BalanceData).parse(data)
  if (!parsed.data) throw new Error('잔액 응답에 data가 없습니다.')
  return parsed.data
}

export async function fetchTekcitHistory(params: { page?: number; size?: number }): Promise<WalletHistoryPage> {
  const page = params?.page ?? 0
  const size = Math.max(1, params?.size ?? 10)
  const { data } = await api.get('/tekcitpay/history', { params: { page, size } }) // 주석: yearMonth 안 보냄 멍

  const parsed = Envelope(SpringPageRaw).safeParse(data)
  if (!parsed.success || !parsed.data.data) {
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
      sort: undefined,
      pageable: undefined,
    }
  }
  return normalizePage(parsed.data.data)
}

/* ───────── React Query ───────── */
export const WalletQueryKeys = {
  balance: ['wallet', 'balance'] as const,
  history: (page: number, size: number) => ['wallet', 'history', page, size] as const,
}

export function useWalletBalance() {
  return useQuery<TekcitBalance>({
    queryKey: WalletQueryKeys.balance,
    queryFn: fetchTekcitBalance,
    staleTime: 30_000,
    retry: 0,
    refetchOnWindowFocus: false,
  })
}

export function useWalletHistory(opts: { page: number; size: number }) {
  const { page, size } = opts
  return useQuery<WalletHistoryPage>({
    queryKey: WalletQueryKeys.history(page, size),
    queryFn: () => fetchTekcitHistory({ page, size }),
    keepPreviousData: true,
    retry: 0,
    refetchOnWindowFocus: false,
  })
}

export async function getWalletBalance(): Promise<number> {
  const b = await fetchTekcitBalance()
  return b.availableBalance
}
