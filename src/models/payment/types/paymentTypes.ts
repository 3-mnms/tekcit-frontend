// 예매 결제 페이지 관련 타입 정의

// 결제 수단 선택 타입
export type PaymentMethod = 'wallet' | 'Toss'

// 프론트 예매 페이지에서 받아오는 정보 타입
export type CheckoutState = {
  bookingId: string
  posterUrl?: string
  title: string
  performanceDate: string
  unitPrice: number
  quantity: number
  deliveryMethod: string
  buyerName?: string
  bookerName?: string
  festivalId?: string
}

// ✅ 서버 세션 생성 응답 타입(백엔드 스펙에 맞게 조정)
// 판매자 ID는 예매 api 받아와야함
export type CreateSessionResponse = {
  bookingId: string   // 서버가 생성한 가예매/주문 ID
  sellerId: number    // 판매자 ID
}
