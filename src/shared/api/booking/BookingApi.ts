import axios from 'axios';
import type {
  BookingSelect,
  BookingSelectDelivery,
  Booking,
  FestivalDetail,
  BookingDetail,
} from '@/models/booking/BookingTypes';

// --- 공통 설정 시작 --- //
const TOKEN_KEY = 'accessToken'; // localStorage에 저장된 키 이름 맞춰줘!

// base axios 인스턴스 생성
const api = axios.create({
  baseURL: '/api', // vite.config.js 프록시 있으니 /api로 통일
  headers: { 'Content-Type': 'application/json' },
});

// 요청마다 토큰 붙이기
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    const hasBearer = /^Bearer\s+/i.test(token);
    config.headers.Authorization = hasBearer ? token : `Bearer ${token}`;
  }
  return config;
});

// (선택) 401이면 토큰 제거 + 로그인 리다이렉트
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login?reason=expired';
    }
    return Promise.reject(err);
  }
);
// --- 공통 설정 끝 --- //

// SuccessResponse<T> 형태라 가정: { data: T, message?: string, ... }

export async function apiGetPhase1Detail(req: BookingSelect) {
  const { data } = await api.post('/booking/detail/phases/1', req);
  return data as { data: FestivalDetail };
}

export async function apiGetPhase2Detail(req: Booking) {
  const { data } = await api.post('/booking/detail/phases/2', req);
  return data as { data: BookingDetail };
}

export async function apiSelectDate(req: BookingSelect) {
  const { data } = await api.post('/booking/selectDate', req);
  return data as { data: string }; // reservationNumber 반환
}

export async function apiSelectDelivery(req: BookingSelectDelivery) {
  const { data } = await api.post('/booking/selectDeliveryMethod', req);
  console.log("배송 데이터", data);
  return data as { data: null };
}

export async function apiReserveTicket(req: Booking) {
  const { data } = await api.post('/booking/qr', req);
  return data as { data: null };
}
