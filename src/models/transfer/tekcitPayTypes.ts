// src/models/transfer/tekcitPayTypes.ts

/** GET /tekcitpay 응답 DTO */
export type TekcitPayAccountResponseDTO = {
  availableBalance: number; // Long -> number
  updatedAt: string;        // LocalDateTime -> ISO string
};

/** POST /tekcitpay/create-account 바디 */
export type CreateTekcitPayAccountRequestDTO = {
  password: number;         // Long
};

/** POST /tekcitpay 바디 (결제) */
export type PayByTekcitPayDTO = {
  amount: number;           // Long
  paymentId: string;
  password: number;         // Long
};

/** (선택) 공통 에러 타입 */
export type ApiError = {
  errorCode?: string;
  message?: string;
};
