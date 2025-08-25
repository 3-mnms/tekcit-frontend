// src/shared/api/user/address.ts
import { api } from '@/shared/api/axios'

/** 서버 응답 공통 래퍼 */
type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

const unwrap = <T,>(res: any, fallback?: T): T => {
  // 표준 케이스: { success: true, data: ... }
  if (res && (res.success === true || res.ok === true || res.status === 'SUCCESS')) {
    if (res.data !== undefined && res.data !== null) return res.data as T
    if (fallback !== undefined) return fallback
    // success인데 data가 없는 경우도 허용하고 fallback 없으면 빈값 리턴 시도
    return ([] as unknown) as T
  }

  // 어떤 백엔드는 data를 최상위로 직접 주기도 함
  if (res && res.data !== undefined) {
    return res.data as T
  }

  throw new Error(res?.message || 'API response invalid')
}

/** ====== Types ====== */
export type AddressRequestDTO = {
  address: string
  zipCode: string
  name: string
  phone: string
}

export type AddressDTO = {
  name: string
  phone: string
  address: string
  zipCode: string
  isDefault: boolean
}

/** ====== API functions ====== */
export const getAddresses = async (): Promise<AddressDTO[]> => {
  const { data } = await api.get('/api/addresses')
  // 204 No Content면 data가 빈 문자열일 수 있음 → []로
  if (!data || typeof data !== 'object') return []
  return unwrap<AddressDTO[]>(data, [])
}

export const addAddress = async (payload: AddressRequestDTO): Promise<AddressDTO> => {
  const { data } = await api.post<ApiResponse<AddressDTO>>('/api/addresses', payload)
  return unwrap(data)
}

/** addressId는 경로 파라미터로만 사용 (DTO에 id 없음) */
export const updateAddress = async (addressId: number, payload: AddressRequestDTO): Promise<AddressDTO> => {
  const { data } = await api.patch<ApiResponse<AddressDTO>>(
    `/api/addresses/updateAddress/${addressId}`,
    payload
  )
  return unwrap(data)
}

export const changeDefaultAddress = async (addressId: number): Promise<AddressDTO> => {
  const { data } = await api.patch<ApiResponse<AddressDTO>>(
    `/api/addresses/changeDefault/${addressId}`
  )
  return unwrap(data)
}

export const deleteAddress = async (addressId: number): Promise<void> => {
  await api.delete(`/api/addresses/${addressId}`)
}
