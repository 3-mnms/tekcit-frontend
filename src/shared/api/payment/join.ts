// src/shared/api/payment/Join.ts
// 테킷 페이 "가입(계좌 생성)" 전용 API 모듈
// - Body 스펙: { password: string } (6자리 숫자 문자열 권장)
// - Header: X-User-Id 는 axios 인터셉터에서 자동 부착된다고 가정

import { z } from 'zod'
import { api } from '@/shared/config/axios'

/* ───────────────────────── Zod 스키마 ───────────────────────── */
// 서버 DTO(CreateRequestDTO)와 일치 — password는 문자열
export const CreateAccountRequestSchema = z.object({
  password: z.string().regex(/^\d{6}$/, '결제 PIN은 숫자 6자리여야 합니다.'),
})
export type CreateAccountRequest = z.infer<typeof CreateAccountRequestSchema>

/* ───────────────────────── API 함수 ───────────────────────── */
/**
 * 테킷 페이 계정 생성 API — POST /tekcitpay/create-account
 * 응답은 SuccessResponse<Void> 형태이므로 반환값을 사용하지 않음
 */
export async function createTekcitPayAccount(
  input: CreateAccountRequest
): Promise<void> {
  const parsed = CreateAccountRequestSchema.parse(input) // 입력값 검증
  await api.post('/tekcitpay/create-account', parsed, {
    headers: { 'Content-Type': 'application/json' },
  })
}
