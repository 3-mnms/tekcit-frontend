/* ========= 프론트 표현 ========= */
export type TransferType = 'FAMILY' | 'OTHERS';
export type TransferStatusFR = 'PENDING' | 'ACCEPTED' | 'REJECTED';

/* ========= 백엔드 표현 =========
 * 문자열 enum이 정식 규격: 'REQUESTED' | 'APPROVED' | 'COMPLETED' | 'CANCELED'
 * (하위호환: 서버가 숫자를 보내는 경우도 수용)
 */
export type TransferStatusBEString = 'REQUESTED' | 'APPROVED' | 'COMPLETED' | 'CANCELED';
export type TransferStatusBE = 0 | 1 | 2 | 3;  // 수신 하위호환용

/* ========= 요청 DTO ========= */
export type TicketTransferRequest = {
  reservationNumber: string;
  recipientId: number;
  transferType: TransferType;
  senderName: string;
};

export type PersonInfo = {
  name: string;
  rrnFront: string;
};

/* ========= 수신 아이템 ========= */
export type TransferWatchItem = {
  senderId: number;
  senderName: string;
  type: TransferType | string | number;
  createdAt: string;
  // 서버 status(숫자 또는 문자열) 어떤 게 와도 수용
  status: TransferStatusBE | TransferStatusBEString | string;
  fname: string;
  posterFile: string;
  fcltynm: string;
  ticketPrice: number;
  performanceDate: string;
  selectedTicketCount: number;
};

/* ========= 응답 DTO ========= */
// 프론트에서 쓰는 응답 폼(ACCEPTED/REJECTED)을 API가 내부에서 BE 문자열로 변환
export type UpdateTicketRequest = {
  transferId: number;
  senderId: number;
  transferStatus: TransferStatusFR; // 'ACCEPTED' | 'REJECTED' | 'PENDING'
  deliveryMethod?: string;
  address?: string;
};

/* ========= Others 수락 응답 ========= */
export type TransferOthersResponse = {
  receiverId: number;
  senderId: number;
  reservationNumber: string;
  selectedTicketCount: number;
  performanceDate: string;  // ISO string
  ticketPrice: number;
  fname: string;
  posterFile: string;
};

/* ========= OCR ========= */
export type ExtractPayload = {
  file: File;
  targetInfo: Record<string, string>;
};
export type ExtractResponse = PersonInfo[];

/* ========= Envelope ========= */
export type ApiOk<T> = { success: true; data: T; message?: string };
export type ApiErr = { success: false; errorCode?: string; errorMessage?: string; message?: string };
export type ApiEnvelope<T> = ApiOk<T> | ApiErr | T;

/* ========= 상태 매퍼 ========= */
/** 프론트(ACCEPTED/REJECTED/PENDING) → 백엔드 문자열(REQUESTED/APPROVED/CANCELED) */
export const FRtoBEString = (s: TransferStatusFR): TransferStatusBEString => {
  switch (s) {
    case 'ACCEPTED': return 'APPROVED';
    case 'REJECTED': return 'CANCELED';
    case 'PENDING':
    default: return 'REQUESTED';
  }
};

// 서버에서 오는 status(문자/숫자)를 프론트 표기로
export const BEtoFR = (s: TransferStatusBE | string): TransferStatusFR => {
  if (typeof s === 'string') {
    const v = s.trim().toUpperCase();
    if (v === 'APPROVED') return 'ACCEPTED';
    if (v === 'CANCELED') return 'REJECTED';
    // REQUESTED/COMPLETED → UI 정책에 따라 기본 PENDING
    return 'PENDING';
  }
  // 숫자 하위호환
  if (s === 1) return 'ACCEPTED';
  if (s === 3) return 'REJECTED';
  return 'PENDING';
};
