// 컨트롤러 DTO와 1:1
export interface WaitingNumberResponseDTO {
  userId: string;
  waitingNumber: number;       // 0이면 즉시 입장
  immediateEntry: boolean;     // true면 바로 예매 페이지로
  message: string;             // "REDIRECT_TO_BOOKING_PAGE" | "WAITING_QUEUE_ENTERED" 등
}

// 훅/요청 파라미터 타입
export interface WaitingEnterParams {
  festivalId: string;
  reservationDate: Date;
}

export interface WaitingReleaseParams {
  festivalId: string;
  reservationDate: Date;
}

export interface WaitingExitParams {
  festivalId: string;
  reservationDate: Date;
}

// ✅ LocalDateTime 쿼리 파라미터 직렬화 (Spring LocalDateTime용)
export function toLocalDateTimeParam(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  // 타임존/밀리초 없이 반환 (e.g., 2025-10-18T11:00:00)
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}`;
}
