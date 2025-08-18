import { api } from '@/shared/api/axios'

export interface LoginPayload {
  loginId: string
  loginPw: string
}

export interface LoginResponseDTO {
  accessToken: string
}

export interface ReissueResponseDTO {
  accessToken: string
  refreshToken?: string
}

// 공통 래퍼 타입
type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

function unwrap<T>(res: ApiResponse<T>): T {
  if (res?.success && res?.data) return res.data
  throw new Error(res?.message || 'API response invalid')
}

export const login = async (payload: LoginPayload): Promise<LoginResponseDTO> => {
  const { data } = await api.post<ApiResponse<LoginResponseDTO>>('/users/login', payload)
  const body = unwrap(data)
  if (!body.accessToken) throw new Error('No accessToken in response')
  return body
}

export const logout = async (): Promise<void> => {
  await api.post('/users/logout')
}

export const reissue = async (): Promise<ReissueResponseDTO> => {
  const { data } = await api.post<ApiResponse<ReissueResponseDTO>>('/users/reissue')
  const body = unwrap(data)
  if (!body.accessToken) throw new Error('No accessToken in reissue')
  return body
}
