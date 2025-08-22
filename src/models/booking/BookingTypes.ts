export interface Schedule {
  scheduleId: number;   // 공연 일정 PK
  dayOfWeek: string;    // 요일 코드 (예: MON, TUE, ...)
  time: string;         // 공연 시작 시간 (HH:mm)
}

export interface FestivalDetail {
  fname: string;            // festival 이름
  ticketPrice: number;      // 티켓 가격
  posterFile: string;       // 포스터 파일 경로
  maxPurchase: number;      // 최대 구매 가능 매수
  schedules: Schedule[];    // 공연 스케줄 목록
  performanceDate: string;  // 선택한 날짜/시간
}

export interface BookingDetail {
  festivalName: string;     // 공연명
  ticketPrice: number;      // 티켓 가격
  posterFile: string;       // 포스터 파일 경로
  performanceDate: string;  // LocalDateTime -> ISO 문자열
  ticketCount: number;      // 선택 매수
}

export interface BookingSelect {
  festivalId: string;
  performanceDate: string;
  selectedTicketCount: number;
}

export interface BookingSelectDelivery {
  festivalId: string;
  reservationNumber: string;
  deliveryMethod: string;      // 필요 시 'MOBILE' | 'PAPER' 로 좁혀도 됨
}

export interface Booking {
  festivalId: string;
  reservationNumber: string;
}