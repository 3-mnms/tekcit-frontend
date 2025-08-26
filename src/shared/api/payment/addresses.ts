import { api } from '@/shared/config/axios'

// ✅ 서버 원본 구조
type AddressRaw = {
  id?: number
  address: string
  zipCode: string
  default: boolean
}

// ✅ 프론트에서 사용할 DTO
export type AddressDTO = {
  id?: number
  address: string
  zipCode: string
  isDefault: boolean
}

// ✅ 공통 응답 래퍼
type SuccessResponse<T> = {
  data: T
  message?: string
}

// ✅ 목록 조회
export const getAddresses = async (): Promise<AddressDTO[]> => {
  const res = await api.get<SuccessResponse<AddressRaw[]>>('/addresses')
  const arr = Array.isArray(res.data.data) ? res.data.data : []
  return arr.map((x) => ({
    id: x.id,
    address: x.address ?? '',
    zipCode: x.zipCode ?? '',
    isDefault: !!x.default, // 🔑 필드명 매핑
  }))
}
