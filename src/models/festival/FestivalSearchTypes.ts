/** 백엔드 공통 성공 래퍼 (프로젝트 래퍼 구조에 맞춰 조정) */
export interface ApiSuccessResponse<T> {
  data: T;            // ← SuccessResponse<T> 내부 필드명이 'data'라고 가정
  // code?: string;
  // message?: string;
}

/** 검색 파라미터 (백엔드 스펙) */
export interface FestivalSearchParams {
  genre?: string;     // ex) "대중음악" 등 백엔드가 기대하는 장르명
  keyword?: string;
}

/** 단일 공연 아이템 (필드명은 백엔드 응답에 맞춰 확장) */
export interface FestivalItem {
  id: string | number;
  title: string;
  poster?: string;
  venue?: string;
  dateRange?: string;
  // 필요시 추가: startDate, endDate, place, price, ...
}
