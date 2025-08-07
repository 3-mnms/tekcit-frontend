// 공연 기본 정보
export interface BookingProduct {
  title: string
  datetime: string
  location: string
  seat: string[]
  price: string
}

// 양도 정보 전체
export interface BookingTransfer {
  product: BookingProduct
  sender: string
  receiver: string
}

// 테스트용 더미 데이터 (API 연동 전까지 사용 가능)
export const bookingTransfer: BookingTransfer = {
  product: {
    title: '하울❤️의 움직이는 성🏰',
    datetime: '2025.09.21 (일) 오후 3시',
    location: '강남아트홀 1관',
    seat: ['R석 1층 B열 13번', 'R석 1층 B열 14번'],
    price: '380,000원',
  },
  sender: '정혜영',
  receiver: '김민정',
}
