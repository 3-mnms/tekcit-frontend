// 추가/정리: 상태 & 응답 타입
export type TransferType = 'FAMILY' | 'OTHERS';
export type TransferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

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

export type TransferWatchItem = {
  senderId: number;
  senderName: string;
  type: TransferType;
  createdAt: string;
  status: TransferStatus | string;
  fname: string;
  posterFile: string;
  fcltynm: string;
  ticketPrice: number;
  performanceDate: string;
  selectedTicketCount: number;
};

// ✅ 백엔드 UpdateTicketRequestDTO와 매칭
export type UpdateTicketRequest = {
  transferId: number;           // Long transferId
  senderId: number;             // Long senderId
  transferStatus: TransferStatus; // 'ACCEPTED' | 'REJECTED' | 'PENDING'
  deliveryMethod?: string;      // family/others 공통 확장
  address?: string;             // paper 배송 시 주소
};

// ✅ 백엔드 TransferOthersResponseDTO 대응
export type TransferOthersResponse = {
  receiverId: number;
  senderId: number;
  reservationNumber: string;
  selectedTicketCount: number;
  performanceDate: string;  // ISO string (LocalDateTime)
  ticketPrice: number;
  fname: string;
  posterFile: string;
};

export type ExtractPayload = {
  file: File;
  targetInfo: Record<string, string>;
};
export type ExtractResponse = PersonInfo[];

export type ApiOk<T> = { success: true; data: T; message?: string };
export type ApiErr = { success: false; errorCode?: string; errorMessage?: string; message?: string };
export type ApiEnvelope<T> = ApiOk<T> | ApiErr | T;
