// src/shared/api/transfer/tekcitPay.ts
import { api } from '@/shared/config/axios';

/** 서버 공통 에러 포맷이 이런 형태라 가정 */
export type ApiError = {
  errorCode?: string;
  message?: string;
};

/** GET /api/tekcitpay 응답 DTO */
export type TekcitPayAccountResponseDTO = {
  availableBalance: number;         // Long → number로 받음
  updatedAt: string;                // LocalDateTime → ISO string
};

/** POST /api/tekcitpay/create-account 바디 */
export type CreateTekcitPayAccountRequestDTO = {
  password: number;                 // Long
};

/** (선택) POST /api/tekcitpay 바디: 결제 */
export type PayByTekcitPayDTO = {
  amount: number;                   // Long
  paymentId: string;                // @NotBlank
  password: number;                 // Long
};

/** 계정 조회 (존재/잔액 확인) */
export async function getTekcitPayAccount() {
  const { data } = await api.get<{ data: TekcitPayAccountResponseDTO }>('/tekcitpay');
  return data.data;
}

/** 계정 생성 (미개설 시) */
export async function createTekcitPayAccount(password: number) {
  const body: CreateTekcitPayAccountRequestDTO = { password };
  await api.post('/tekcitpay/create-account', body);
}

/** (선택) 테킷페이 결제 */
export async function payByTekcitPay(dto: PayByTekcitPayDTO) {
  await api.post('/tekcitpay', dto);
}

/** 헬퍼: '계정 없음' 에러 식별 */
export function isNoTekcitPayAccountError(e: unknown) {
  const err = e as any;
  const code: string | undefined = err?.response?.data?.errorCode;
  return code === 'NOT_FOUND_TEKCIT_PAY_ACCOUNT';
}
