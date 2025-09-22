/* ========= 공통 ========= */
export type TransferType = 'FAMILY' | 'OTHERS';
export type TransferStatusFR = 'PENDING' | 'ACCEPTED' | 'REJECTED';

/* ========= 백엔드 표현 ========= */
export type TransferStatusBEString = 'REQUESTED' | 'APPROVED' | 'COMPLETED' | 'CANCELED';
export type TransferStatusBE = 0 | 1 | 2 | 3;

/* ========= 새로 추가: 티켓 픽(수령 방식 제한) =========
 * 1 = ALL(모두 허용), 2 = QR_ONLY(QR만)
 */
export type TicketPick = 1 | 2;
export type DeliveryConstraint = 'ALL' | 'QR_ONLY';

/** ticketPick → 제약 문자열 */
export const deliveryConstraintFromPick = (tp?: unknown): DeliveryConstraint => {
  const n = Number(tp);
  return n === 2 ? 'QR_ONLY' : 'ALL';
};

/** 특정 수령 방식이 허용되는지 검사 */
export const isDeliveryAllowed = (
  method: 'QR' | 'PAPER' | '' | null | undefined,
  tp?: TicketPick
): boolean => {
  if (!method) return true; // 미선택 단계는 통과
  const cons = deliveryConstraintFromPick(tp);
  return cons === 'ALL' ? true : method === 'QR';
};

/* ========= 요청 DTO ========= */
export type TicketTransferRequest = {
  reservationNumber: string;
  recipientId: number;
  transferType: TransferType;
  senderName: string;
};

/* ========= 수신 아이템(프론트에서 쓰는 정규화본) ========= */
export type TransferWatchItem = {
  transferId: number;
  senderId: number;
  senderName: string;
  type: TransferType | string; // 'FAMILY' | 'OTHERS' (정규화되지만 string 허용)
  createdAt: string;
  status: TransferStatusBE | TransferStatusBEString | string;

  fname: string;
  posterFile: string;
  fcltynm: string;
  ticketPrice: number;

  performanceDate: string;
  selectedTicketCount: number;

  reservationNumber: string;

  /** ✅ BE 원본 숫자 (1=ALL, 2=QR_ONLY). 누락 시 프론트에서 1로 보정 */
  ticketPick: TicketPick;

  /** ✅ 파생: 'ALL' | 'QR_ONLY' */
  deliveryConstraint: DeliveryConstraint;
};

/* ========= 승인/거절 DTO ========= */
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
export type PersonInfo = { name: string; rrnFront: string };
export type ExtractPayload = { file: File; targetInfo: Record<string, string> };
export type ExtractResponse = PersonInfo[];

/* ========= Envelope ========= */
export type ApiOk<T> = { success: true; data: T; message?: string };
export type ApiErr = { success: false; errorCode?: string; errorMessage?: string; message?: string };
export type ApiEnvelope<T> = ApiOk<T> | ApiErr | T;

/* ========= 상태 매퍼 ========= */
export const FRtoBEString = (s: TransferStatusFR): TransferStatusBEString => {
  switch (s) {
    case 'ACCEPTED': return 'COMPLETED';
    case 'REJECTED': return 'CANCELED';
    case 'PENDING':
    default: return 'REQUESTED';
  }
};

export const BEtoFR = (s: TransferStatusBE | string): TransferStatusFR => {
  const v = typeof s === 'string' ? s.trim().toUpperCase() : String(s);
  if (v === '0' || v === 'REQUESTED' || v === '1' || v === 'APPROVED') return 'PENDING';
  if (v === '2' || v === 'COMPLETED') return 'ACCEPTED';
  if (v === '3' || v === 'CANCELED' || v === 'CANCELLED') return 'REJECTED';
  return 'PENDING';
};

/* ========= 상태 정규화 유틸 ========= */
export const normalizeBEStatus = (s: unknown): TransferStatusBEString => {
  if (typeof s === 'number') {
    return (['REQUESTED', 'APPROVED', 'COMPLETED', 'CANCELED'][s] ?? 'REQUESTED') as TransferStatusBEString;
  }
  const v = String(s ?? '').trim().toUpperCase();
  if (['0', 'REQUEST', 'REQUESTED', 'PENDING', 'WAITING'].includes(v)) return 'REQUESTED';
  if (['1', 'APPROVED', 'ACCEPTED', 'OK'].includes(v)) return 'APPROVED';
  if (['2', 'COMPLETED', 'DONE', 'SUCCESS'].includes(v)) return 'COMPLETED';
  if (['3', 'CANCELED', 'CANCELLED', 'REJECTED', 'DENIED', 'DECLINED'].includes(v)) return 'CANCELED';
  return 'REQUESTED';
};
