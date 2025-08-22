import { useQuery } from '@tanstack/react-query';
import { bookingDetailSchema, type bookingDetail } from '@models/booking/BookingTypes';

export function usebookingDetail(ticketId: string) {
  return useQuery({
    queryKey: ['booking-detail', ticketId],
    queryFn: async (): Promise<bookingDetail> => {
      const res = await api.get(`/booking/${ticketId}`); // 실제 엔드포인트에 맞춰 수정
      const parsed = bookingDetailSchema.parse(res.data);
      return parsed;
    },
  });
}
