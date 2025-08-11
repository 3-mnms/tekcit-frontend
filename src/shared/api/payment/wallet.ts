// src/shared/api/wallet.ts
export type SimpleMethod = '네이버페이' | '카카오페이'

export interface WalletHistoryItem {
  id: string
  type: 'charge' | 'refund'
  amount: number // 충전은 +, 환불은 -로 저장
  method?: SimpleMethod
  createdAt: string // ISO
}

const BAL_KEY = 'wallet.balance'
const HIS_KEY = 'wallet.history'
const DEFAULT_BAL = 0

const readBal = () => Number(localStorage.getItem(BAL_KEY) ?? DEFAULT_BAL)
const writeBal = (v: number) => localStorage.setItem(BAL_KEY, String(v))
const readHis = (): WalletHistoryItem[] => JSON.parse(localStorage.getItem(HIS_KEY) ?? '[]')
const writeHis = (list: WalletHistoryItem[]) => localStorage.setItem(HIS_KEY, JSON.stringify(list))

export const getWalletBalance = async (): Promise<number> => {
  return readBal()
}

export const getWalletHistory = async (): Promise<WalletHistoryItem[]> => {
  return readHis()
}

// 완료 페이지에서 한 번만 호출되도록 txId를 넘겨주면 중복 저장 방지 가능해요
export const chargeWallet = async (
  amount: number,
  method: SimpleMethod,
  txId?: string,
): Promise<void> => {
  if (!Number.isFinite(amount) || amount <= 0) return

  // 잔액 반영
  const next = readBal() + amount
  writeBal(next)

  // 내역 추가
  const id = txId ?? String(Date.now())
  const item: WalletHistoryItem = {
    id,
    type: 'charge',
    amount,
    method,
    createdAt: new Date().toISOString(),
  }
  writeHis([item, ...readHis()])
}

// 필요 시 환불도 같은 패턴으로
export const refundWallet = async (amount: number, reason?: string) => {
  if (!Number.isFinite(amount) || amount <= 0) return
  const next = readBal() - amount
  writeBal(Math.max(0, next))
  const item: WalletHistoryItem = {
    id: String(Date.now()),
    type: 'refund',
    amount: -amount,
    createdAt: new Date().toISOString(),
  }
  writeHis([item, ...readHis()])
}
