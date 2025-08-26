export interface BookingProduct {
  title: string
  datetime: string
  location: string
  ticket: number
  price: string
}

export const bookingProduct: BookingProduct = {
  title: '콘서트',
  datetime: '2025.09.21 (일) 오후 3시',
  location: '강남아트홀 1관',
  ticket: 2,
  price: '100,000원',
}
