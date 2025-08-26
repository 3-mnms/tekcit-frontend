export interface PreReservationDTO {
  name: string;
  phone: string;
  email: string;
}

// 백엔드 공통 응답 껍데기(이미 있으면 그거 써도 됨)
export interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}