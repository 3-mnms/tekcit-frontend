// UI 값
export type DeliveryMethodUI = 'QR' | 'PAPER';

// BE 값
export type DeliveryMethodBE = 'MOBILE' | 'PAPER';

// UI → BE 매핑
export const mapUiToBeDelivery = (ui: DeliveryMethodUI): DeliveryMethodBE =>
  ui === 'QR' ? 'MOBILE' : 'PAPER';

// 공연 스케줄
export interface Schedule {
  scheduleId: number;
  dayOfWeek: string;  // MON, TUE...
  time: string;       // HH:mm
}

// 공연 상세
export interface FestivalDetail {
  fname: string;
  ticketPrice: number;
  posterFile: string;
  maxPurchase: number;
  schedules: Schedule[];
  performanceDate: string; // YYYY-MM-DD
}

// 예매 상세
export interface BookingDetail {
  festivalName: string;
  ticketPrice: number;
  posterFile: string;
  performanceDate: string; // ISO string (LocalDateTime)
  ticketCount: number;
}

// Step1: 날짜/매수 선택
export interface BookingSelect {
  festivalId: string;
  performanceDate: string;
  selectedTicketCount: number;
}

// Step2: 수령방법 선택 (BE 요청)
export interface BookingSelectDelivery {
  festivalId: string;
  reservationNumber: string;
  deliveryMethod: DeliveryMethodBE;
  address?: string; // PAPER일 때만 필요
}

// 최종 발권
export interface Booking {
  festivalId: string
  performanceDate: string   // ISO string (LocalDateTime 매핑됨)
  reservationNumber: string
}
