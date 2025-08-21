// 📄 models/payment/Address.ts

// 배송지 타입 정의
export interface Address {
  id: number
  name: string       // ✅ 사용자 이름
  phone: string      // ✅ 전화번호
  address1: string
  address2: string
  isDefault: boolean
}

// mock 데이터
export const mockAddresses: Address[] = [
  {
    id: 1,
    name: '홍길동',
    phone: '010-1234-5678',
    address1: '서울특별시 강남구 테헤란로 123',
    address2: '강남타워 101호',
    isDefault: true,
  },
  {
    id: 2,
    name: '김민정',
    phone: '010-9876-5432',
    address1: '서울특별시 마포구 월드컵북로 45',
    address2: '마포프라자 202호',
    isDefault: false,
  },
  {
    id: 3,
    name: '이영희',
    phone: '010-5555-7777',
    address1: '부산광역시 해운대구 센텀중앙로 26',
    address2: '센텀오피스텔 303호',
    isDefault: false,
  },
]
