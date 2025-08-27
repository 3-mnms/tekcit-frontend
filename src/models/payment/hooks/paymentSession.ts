// 세션 생성 훅 (페이지 진입 시 1회 호출 -> 나중에 수정하자)

import { useEffect, useState } from 'react'
import { api } from '@/shared/config/axios'
import type { CreateSessionResponse } from '@/models/payment/types/paymentTypes'

/** 서버 결제 세션(bookingId/sellerId/amount)을 생성해 보관하는 훅 */
export function usePaymentSession(payload: {
  festivalId: string
  unitPrice: number
  quantity: number
  deliveryMethod: string
  title: string
}) {
  // 세션 상태 (필요 최소만 가짐)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [sellerId, setSellerId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // payload가 충분하지 않으면 시도하지 않음
    if (!payload.festivalId) return

    ;(async () => {
      try {
        setIsLoading(true)
        setError(null)
        const { data } = await api.post<CreateSessionResponse>('/payments/session', payload)
        setBookingId(data.bookingId)
        setSellerId(data.sellerId)
      } catch (e) {
        console.error('[usePaymentSession] error:', e)
        setError('결제 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.')
      } finally {
        setIsLoading(false)
      }
    })()
    // payload가 바뀌면 다시 생성(현재 요구사항 기준 과도한 방어는 하지 않음)
  }, [payload.festivalId, payload.unitPrice, payload.quantity, payload.deliveryMethod, payload.title])

  return { bookingId, sellerId, isLoading, error }
}
