import { useAuth } from '@/models/auth/useAuth'
import { api } from '@/shared/config/axios'
import { useAuthStore } from '@/shared/storage/useAuthStore'

// 🔹 백엔드 DTO
export type AddressDTO = {
  name: string               // 수령인 이름
  phone: string              // 전화번호
  address: string            // 단일 주소(도로명/지번 등)
  zipCode?: string           // 우편번호
  default: boolean           // 기본 배송지 여부
}

// 🔹 공통 응답 래퍼 
export type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

function unwrapOrThrow<T>(resp: ApiResponse<T>): T {
  if (!resp?.success) {
    // 서버에서 내려준 message 우선 사용
    throw new Error(resp?.message || '요청 처리에 실패했습니다.')
  }
  return resp.data
}

const accessToken = useAuthStore.getState().accessToken

// 주소 목록 조회
export async function getAddress(): Promise<AddressDTO[]> {
    console.log('[getAddress] calling with token:', accessToken?.slice(0, 12), '...');
  
    // 백엔드 api 엔드포인트 호출
    const { data } = await api.get<ApiResponse<AddressDTO[]>>('/addresses/allAddress', {
    params: { _: Date.now() },
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  return unwrapOrThrow(data)
}

export const AddressQueryKeys = {
  all: ['addresses'] as const,
  list: () => ['addresses'] as const,
}
