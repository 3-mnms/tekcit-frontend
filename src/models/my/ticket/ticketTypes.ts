// src/models/ticket/ticketTypes.ts
export type ReservationStatus = 'CONFIRMED' | 'CANCELED' | 'TEMP_RESERVED' | 'PAYMENT_IN_PROGRESS';

export type TicketResponseDTO = {
  id: number;
  reservationNumber: string;        // 예매번호
  performanceDate: string;          // ISO(또는 yyyy-MM-ddTHH:mm:ss) 로컬 DateTime
  selectedTicketCount: number;      // 매수
  deliveryMethod: 'MOBILE' | 'PAPER';   // TicketType
  reservationDate: string;          // yyyy-MM-dd
  reservationStatus: ReservationStatus;

  // festival
  fname: string;    // 공연명
  fcltynm: string;  // 장소
};

export type TicketListItem = {
  id: number;
  date: string;          // 2025.07.01
  number: string;        // 예매번호
  title: string;         // 공연명
  dateTime: string;      // 2025.10.18 17:00
  count: number;         // 매수
  statusLabel: string;   // 예매 완료 / 취소 완료 등
  rawStatus: ReservationStatus;
  reservationNumber: string;
};

// src/models/ticket/ticketDetailTypes.ts
export type TicketType = 'MOBILE' | 'PAPER';

export type TicketDetailResponseDTO = {
  id: number;
  reservationNumber: string;   // 예매 번호
  performanceDate: string;     // ISO LocalDateTime
  deliveryMethod: TicketType;  // 'QR' | 'PAPER'
  qrId: string[];              // QR 코드 문자열 배열
  address?: string | null;     // 지류 배송 주소 (PAPER일 때)
  fname: string;               // 공연명
  fcltynm: string;             // 장소
};
