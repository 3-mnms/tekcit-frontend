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

export const login = async (payload: LoginPayload): Promise<LoginResponseDTO> => {
  const { data } = await api.post<LoginResponseDTO>('/users/login', payload)
  return data
}

export const logout = async (): Promise<void> => {
  await api.post('/users/logout')
}

export const reissue = async (): Promise<ReissueResponseDTO> => {
  const { data } = await api.post<ReissueResponseDTO>('/users/reissue')
  return data
}