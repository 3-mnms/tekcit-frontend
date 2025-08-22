import axios from 'axios';
import type {
  BookingSelect,
  BookingSelectDelivery,
  Booking,
  FestivalDetail,
  BookingDetail,
} from '@/models/booking/BookingTypes';

// SuccessResponse<T> 형태라 가정: { data: T, message?: string, ... }

export async function apiGetPhase1Detail(req: BookingSelect) {
  const { data } = await axios.post('/api/booking/detail/phases/1', req);
  console.log(data);
  return data as { data: FestivalDetail };
}

export async function apiGetPhase2Detail(req: Booking) {
  const { data } = await axios.post('/api/booking/detail/phases/2', req);
  return data as { data: BookingDetail };
}

export async function apiSelectDate(req: BookingSelect) {
  const { data } = await axios.post('/api/booking/selectDate', req);
  return data as { data: string }; // reservationNumber 반환
}

export async function apiSelectDelivery(req: BookingSelectDelivery) {
  const { data } = await axios.post('/api/booking/selectDeliveryMethod', req);
  return data as { data: null };
}

export async function apiReserveTicket(req: Booking) {
  const { data } = await axios.post('/api/booking/qr', req);
  return data as { data: null };
}
