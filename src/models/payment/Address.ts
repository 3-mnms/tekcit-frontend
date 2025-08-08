export interface Address {
  id: number
  address1: string
  address2: string
  isDefault: boolean
}

// mock 데이터
export const mockAddresses: Address[] = [
  {
    id: 1,
    address1: '서울특별시 강남구 테헤란로 123',
    address2: '한빛타워 101호',
    isDefault: true,
  },
  {
    id: 2,
    address1: '서울특별시 마포구 월드컵북로 45',
    address2: '마포프라자 202호',
    isDefault: false,
  },
  {
    id: 3,
    address1: '부산광역시 해운대구 센텀중앙로 26',
    address2: '센텀오피스텔 303호',
    isDefault: false,
  },
]
