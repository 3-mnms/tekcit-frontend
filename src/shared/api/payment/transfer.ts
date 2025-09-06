// src/shared/api/transfer.ts 멍
// 주석: 양도 관련 API 모듈(Zod 검증 + 폴백 + STOMP/SockJS 헬퍼) 멍

import { z } from 'zod'                     // 응답 검증 멍
import { api } from '@/shared/config/axios' // 공용 axios 인스턴스 멍

// ✅ STOMP/SockJS 추가 멍
import { Client } from '@stomp/stompjs'     // npm i @stomp/stompjs 멍
import SockJS from 'sockjs-client/dist/sockjs.js'

/* ===================== 스키마/타입 ===================== 멍 */
export const TransferSummaryResponseSchema = z.object({
  festivalId: z.number().int().positive(),        // 페스티벌 ID 멍
  festivalTitle: z.string().min(1),               // 제목 멍
  festivalDate: z.string().min(1),                // ISO 문자열 멍
  quantity: z.number().int().positive(),          // 수량 멍
  unitPrice: z.number().int().nonnegative(),      // 1매 가격 멍
  currency: z.string().default('KRW'),            // 통화 멍
  sellerId: z.number().int().positive().optional()// 양도자(없을 수 있음) 멍
})
export type TransferSummaryResponse = z.infer<typeof TransferSummaryResponseSchema>

export const TransferWsMsgSchema = z.object({
  success: z.boolean(),            // 처리 성공 여부 멍
  data: z.boolean(),               // 결제 완료(true)/미완(false) 멍
  message: z.string().optional(),  // 부가 메시지 멍
})
export type TransferWsMsg = z.infer<typeof TransferWsMsgSchema>

export const TransferStatusFallbackSchema = z.object({
  success: z.boolean(),            // 처리 성공 여부 멍
  data: z.boolean(),               // 완료 여부 멍
  message: z.string().optional(),  // 부가 메시지 멍
})
export type TransferStatusFallback = z.infer<typeof TransferStatusFallbackSchema>

/* ===================== API 함수 ===================== 멍 */
export async function getTransferSummary(transferId: string) {
  const { data } = await api.get(`/transfers/${transferId}/summary`)
  return TransferSummaryResponseSchema.parse(data) // 응답 검증 멍
}

export async function postTekcitpayTransfer(params: {
  buyerId: number        // 헤더 X-User-Id 멍
  sellerId: number       // 실제 양도자 멍
  paymentId: string      // 결제 식별자 멍
  bookingId: string      // 예약 ID 멍
  totalAmount: number    // 총액 멍
  commission: number     // 수수료 멍
}) {
  const { buyerId, ...body } = params
  return api.post('/tekcitpay/transfer', body, {
    headers: { 'X-User-Id': String(buyerId) }, // 로그인 양수자 헤더 멍
  })
}

// ✅ 폴백 REST 멍
export async function checkTransferStatus(transferId: string): Promise<TransferStatusFallback> {
  const { data } = await api.get('/transfer/reservation/status', { params: { transferId } })
  return TransferStatusFallbackSchema.parse(data)  // 간단 검증 멍
}

/* ===================== STOMP/SockJS 헬퍼 ===================== 멍 */
// 주석: WebSocketConfig.registerStompEndpoints("/ws")에 맞춘 SockJS 엔드포인트 멍
export const sockJsUrl = () => {
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'
  const httpProto = isHttps ? 'https:' : 'http:'
  const host = typeof window !== 'undefined' ? window.location.host : 'localhost:10000'
  return `${httpProto}//${host}/ws`               // ✅ SockJS는 http(s) 스킴 멍
}

// 주석: 서버의 @SendTo/convertAndSend 목적지에 맞춰 조정 멍
export const transferDestination = (transferId: string) =>
  `/topic/transfer/${transferId}`                 // 예시 경로 멍(서버 경로에 맞게 바꿔도 됨) 멍

// 주석: STOMP 클라이언트 팩토리 멍
export function createStompClient() {
  const client = new Client({
    webSocketFactory: () => new SockJS(sockJsUrl()), // ✅ SockJS 사용 멍
    reconnectDelay: 500,              // 자동 재연결(지수 백오프) 멍
    heartbeatIncoming: 10000,         // 서버→클라 하트비트 멍
    heartbeatOutgoing: 10000,         // 클라→서버 하트비트 멍
    debug: (msg) => console.debug('[STOMP]', msg), // 디버그 멍
  })
  return client
}

