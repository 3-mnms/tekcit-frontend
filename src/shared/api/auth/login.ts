import { api } from '@/shared/config/axios'

export type LoginStatus = 'SUCCESS' | 'CONFLICT'
export interface LoginPayload {
  loginId: string
  loginPw: string
}
export interface LoginResponseDTO {
  accessToken: string
  kind: LoginStatus
}

export interface LoginConflictDTO {
  loginTicket: string
  kind: LoginStatus // "CONFLICT"
}

export type LoginResult = LoginResponseDTO | LoginConflictDTO

export interface ReissueResponseDTO {
  accessToken: string
  refreshToken?: string
}

function unwrap<T>(res: unknown): T {
  if (res == null) throw new Error('empty response')

  if (typeof res === 'object') {
    const obj = res as Record<string, unknown>
    if ('success' in obj && obj.success === true && 'data' in obj) {
      return (obj.data as T)
    }
    if ('status' in obj && obj.status === 'SUCCESS' && 'data' in obj) {
      return (obj.data as T)
    }
    if ('data' in obj) {
      const inner = (obj as { data: unknown }).data
      return unwrap<T>(inner)
    }
  }
  return res as T
}

export const login = async (payload: LoginPayload): Promise<LoginResult> => {
  const { data } = await api.post('/users/login', payload)
  return unwrap<LoginResult>(data)
}

export const confirmLogin = async (ticket: string): Promise<LoginResponseDTO> => {
  const { data } = await api.post('/users/login/confirm', null, {
    params: { ticket },
  })
  return unwrap<LoginResponseDTO>(data)
}

export const logout = async (): Promise<void> => {
  await api.post('/users/logout')
}

export const reissue = async (): Promise<ReissueResponseDTO> => {
  const { data } = await api.post('/users/reissue', {})   
  return unwrap<ReissueResponseDTO>(data)
}

export const isLoginSuccess = (r: LoginResult): r is LoginResponseDTO => r.kind === 'SUCCESS'
export const isLoginConflict = (r: LoginResult): r is LoginConflictDTO => r.kind === 'CONFLICT'