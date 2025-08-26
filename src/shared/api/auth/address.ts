// src/shared/api/user/address.ts
import { api } from '@/shared/config/axios'

/** 서버 응답 공통 래퍼 */
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
}

export type AddressDTO = {
  name: string
  phone: string
  address: string
  zipCode: string
  isDefault: boolean
}

export const getAddresses = async (): Promise<AddressDTO[]> => {
  const { data } = await api.get('/addresses/allAddress')
  if (!data || typeof data !== 'object') return []
  return unwrap<AddressDTO[]>(data, [])
}

export const addAddress = async (payload: AddressRequestDTO): Promise<AddressDTO> => {
  const { data } = await api.post<ApiResponse<AddressDTO>>('/addresses', payload)
  return unwrap(data)
}

export const updateAddress = async (addressId: number, payload: AddressRequestDTO): Promise<AddressDTO> => {
  const { data } = await api.patch<ApiResponse<AddressDTO>>(
    `/addresses/updateAddress/${addressId}`,
    payload
  )
  return unwrap(data)
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
