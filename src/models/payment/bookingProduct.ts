export interface BookingProduct {
  title: string
  datetime: string
  location: string
  seat: string[] // ✅ 배열로 변경
  price: string
}

export const bookingProduct: BookingProduct = {
  title: '하울❤️의 움직이는 성🏰',
  datetime: '2025.09.21 (일) 오후 3시',
  location: '강남아트홀 1관',
  seat: ['R석 1층 B열 13번', 'R석 1층 B열 14번', 'R석 1층 B열 15번'], // ✅ 여러 좌석
  price: '570,000원',
}
