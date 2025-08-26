import { api } from '@/shared/config/axios'

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

// 주소 목록 조회
export async function getAddress(): Promise<AddressDTO[]> {
  // 🔹 발급받은 실제 JWT 토큰 그대로 넣기
  const token =
    "eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJmZXN0aXZhbC11c2VyLXNlcnZpY2UiLCJzdWIiOiIxIiwicm9sZSI6IlVTRVIiLCJuYW1lIjoiXHVBRTQwXHVCQkZDXHVDODE1IiwiaWF0IjoxNzU2MTgwODIwLCJleHAiOjE4MTc1NjE4MDgyMH0.Uof_5MBYlOX7C63Fg7o2wCGA-DGikJf6reNcyUaHwO0AzeN02mI1jl04Y2CFe1d3eSGIP73hYB6IHpbLiRcosuZjfiM9k2kFCWjF5NnX3unh01r5lfrof52igJhzbR0-6wujeM6BSfyCAU_JclrXqczGxFwXeQ-dCKhHJ9FmA3eNv1AiL0cwJ5He1hfJW6gfL-5h5P9-hlxGKSbvlHYcfHhgKuiTT1Gf5ufpXiLZV21OHK7UKHDnqhvF48PloCd4YFCW7_a50PT5poNGGazAGVGDwEkLp6kMbI2Fk33MR1uZ_sMCJjT1KrQn_bSuvYF2xS9DALh8vs-b2T--3tqvVg"
  
    console.log('[getAddress] calling with token:', token?.slice(0, 12), '...');
  
    // 백엔드 api 엔드포인트 호출
    const { data } = await api.get<ApiResponse<AddressDTO[]>>('/addresses/allAddress', {
    params: { _: Date.now() },
    headers: { Authorization: `Bearer ${token}` }, // 👈 토큰 직접 삽입
  })

  return unwrapOrThrow(data)
}

export const AddressQueryKeys = {
  all: ['addresses'] as const,
  list: () => ['addresses'] as const,
}
