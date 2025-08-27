// src/shared/api/user/address.ts
import { api } from '@/shared/config/axios'

type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

const unwrap = <T,>(res: any, fallback?: T): T => {
  if (res && (res.success === true || res.ok === true || res.status === 'SUCCESS')) {
    if (res.data !== undefined && res.data !== null) return res.data as T
    if (fallback !== undefined) return fallback
    return ([] as unknown) as T
  }

  if (res && res.data !== undefined) {
    return res.data as T
  }

  throw new Error(res?.message || 'API response invalid')
}

export type AddressRequestDTO = {
  address: string
  zipCode: string
  name: string
  phone: string
  isDefault: boolean
}

export type AddressDTO = {
  id: number
  name: string
  phone: string
  address: string
  zipCode: string
  isDefault: boolean
}

const normalizeAddress = (raw: any): AddressDTO => ({
  id: raw.id,
  name: raw.name,
  phone: raw.phone,
  address: raw.address,
  zipCode: raw.zipCode,
  isDefault: ('isDefault' in raw) ? Boolean(raw.isDefault) : Boolean(raw.default),
})

/** ⬇️ 전송 정규화: 서버가 기대하는 키 이름으로 변경 */
const toServerPayload = (p: AddressRequestDTO) => ({
  name: p.name,
  phone: p.phone,
  zipCode: p.zipCode,
  address: p.address,
  // 핵심: isDefault 대신 default 로 보냄
  default: p.isDefault,
})

export const getAddresses = async (): Promise<AddressDTO[]> => {
  const { data } = await api.get<ApiResponse<AddressDTO[]>>('/addresses/allAddress')
  return unwrap<AddressDTO[]>(data, [])
}

export const getDefaultAddress = async (): Promise<AddressDTO | null> => {
  const { data } = await api.get<ApiResponse<AddressDTO | null>>('/addresses/defaultAddress')
  return unwrap<AddressDTO | null>(data, null)
}

export const getAddressById = async (addressId: number): Promise<AddressDTO> => {
  const { data } = await api.get<ApiResponse<AddressDTO>>(`/addresses/${addressId}`)
  return unwrap<AddressDTO>(data)
}

export const addAddress = async (payload: AddressRequestDTO): Promise<AddressDTO> => {
  const { data } = await api.post<ApiResponse<any>>('/addresses', toServerPayload(payload))
  return normalizeAddress(data?.data ?? data)
}

export const updateAddress = async (addressId: number, payload: AddressRequestDTO): Promise<AddressDTO> => {
  const { data } = await api.patch<ApiResponse<any>>(
    `/addresses/updateAddress/${addressId}`,
    toServerPayload(payload)
  )
  return normalizeAddress(data?.data ?? data)
}

export const changeDefaultAddress = async (addressId: number): Promise<AddressDTO> => {
  const { data } = await api.patch<ApiResponse<AddressDTO>>(
    `/addresses/changeDefault/${addressId}`
  )
  return unwrap(data)
}

export const deleteAddress = async (addressId: number): Promise<void> => {
  await api.delete(`/addresses/${addressId}`)
}
