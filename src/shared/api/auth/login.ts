import { api } from '@/shared/config/axios'

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

const unwrap = <T,>(res: any): T => {
  if (!res) throw new Error('empty response')
  // axios.response.data 가 res로 들어왔다면
  if (res.success === true || res.status === 'SUCCESS') return (res.data ?? res) as T
  // 백엔드가 래퍼 없이 바로 DTO를 줄 때
  if (res.accessToken) return res as T
  // axios 원본 Response를 그대로 받은 경우
  if (res.data) return unwrap<T>(res.data)
  throw new Error('unexpected response format')
}
export const login = async (payload: { loginId: string; loginPw: string }): Promise<LoginResponseDTO> => {
  const { data } = await api.post('/users/login', payload)
  return unwrap<LoginResponseDTO>(data)
}

export const logout = async (): Promise<void> => {
  await api.post('/users/logout')
}

export const reissue = async (): Promise<ReissueResponseDTO> => {
  const { data } = await api.post('/users/reissue', {})   // withCredentials=true 이므로 쿠키 전송
  return unwrap<ReissueResponseDTO>(data)
}

