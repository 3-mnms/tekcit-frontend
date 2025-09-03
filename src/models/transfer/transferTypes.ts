/* ========= 프론트 표현 ========= */
export type TransferType = 'FAMILY' | 'OTHERS';
export type TransferStatusFR = 'PENDING' | 'ACCEPTED' | 'REJECTED';

/* ========= 백엔드 표현 ========= */
export type TransferStatusBEString = 'REQUESTED' | 'APPROVED' | 'COMPLETED' | 'CANCELED';
export type TransferStatusBE = 0 | 1 | 2 | 3;

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
  transferId: number;   // 서버가 내려주도록 협의 권장
  senderId: number;     // 반드시 "양도자"의 사용자 ID
  senderName: string;
  type: TransferType | string | number;
  createdAt: string;
  status: TransferStatusBE | TransferStatusBEString | string;
  fname: string;
  posterFile: string;
  fcltynm: string;
  ticketPrice: number;
  performanceDate: string;
  selectedTicketCount: number;
};

/* ========= 승인/거절 DTO ========= */
// 프론트 표기로 호출 → API에서 서버 문자열로 변환해 전송
export type UpdateTicketRequest = {
  transferId: number;
  senderId: number;
  transferStatus: TransferStatusFR; // 'ACCEPTED' | 'REJECTED' | 'PENDING'
  deliveryMethod?: 'QR' | 'PAPER' | '' | null;
  address?: string | null;
};

/* ========= Others 수락 응답 ========= */
export type TransferOthersResponse = {
  receiverId: number;
  senderId: number;
  reservationNumber: string;
  selectedTicketCount: number;
  performanceDate: string;
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
export const FRtoBEString = (s: TransferStatusFR): TransferStatusBEString => {
  switch (s) {
    case 'ACCEPTED': return 'COMPLETED';   // 수락 완료 = BE COMPLETED
    case 'REJECTED': return 'CANCELED';    // 거절 = BE CANCELED
    case 'PENDING':
    default: return 'REQUESTED';           // 요청/승인 대기 = BE REQUESTED
  }
};

export const BEtoFR = (s: TransferStatusBE | string): TransferStatusFR => {
  const v = typeof s === 'string' ? s.trim().toUpperCase() : String(s);

  if (v === '0' || v === 'REQUESTED' || v === '1' || v === 'APPROVED') {
    return 'PENDING';
  }
  if (v === '2' || v === 'COMPLETED') {
    return 'ACCEPTED';
  }
  if (v === '3' || v === 'CANCELED' || v === 'CANCELLED') {
    return 'REJECTED';
  }
  return 'PENDING';
};