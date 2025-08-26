// 공연 기본 정보
export interface BookingProduct {
  title: string
  datetime: string
  location: string
  ticket: number
  price: string
}

// 양도 정보 전체
export interface BookingTransfer {
  product: BookingProduct
}

// 테스트용 더미 데이터 (API 연동 전까지 사용 가능)
export const bookingTransfer: BookingTransfer = {
  product: {
    title: '콘서트',
    datetime: '2025.09.21 (일) 오후 3시',
    location: '강남아트홀 1관',
    ticket: 2,
    price: '380,000원',
  },
}
