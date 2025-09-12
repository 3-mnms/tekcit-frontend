import type { ApiSuccessResponse, PreReservationDTO } from '@/models/booking/userType'
import { api } from '@/shared/config/axios';

export async function getPreReservation() {
  const res = await api.get<ApiSuccessResponse<PreReservationDTO>>('/users/preReservation')
  return res.data // { success, data, message? }
}