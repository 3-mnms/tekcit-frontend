import type { ApiSuccessResponse, PreReservationDTO } from '@/models/booking/userType'
import { api } from '@/shared/config/axios';

export async function getPreReservation() {
  const res = await api.get<ApiSuccessResponse<PreReservationDTO>>('/users/preReservation')
  console.log("데이터 : ", res.data);
  return res.data // { success, data, message? }
}