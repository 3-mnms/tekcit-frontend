// ✅ 공용 API 응답 래퍼
export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
};

// ✅ 리스트 응답(공연 조회)
export interface Festival {
  fid: string;          // 공연 ID
  prfnm: string;        // 공연명
  prfpdfrom: string;    // 시작일 (ISO string)
  prfpdto: string;      // 종료일 (ISO string)
  poster: string;       // 포스터 URL
  genrenm?: string;     // 장르명
  prfstate?: string;    // 공연 상태: "공연중" | "공연예정" | "공연종료"
}

// ✅ 상세 응답(공연 상세 조회)
export interface FestivalDetail extends Festival {
  fcast?: string;
  prfage?: string;
  story?: string;
  ticketPrice?: number;
  availableNOP?: number;
  faddress?: string;
  maxPurchase?: number;
  contentFiles?: string[];
}

// ✅ 뷰 카운트 포함 버전
export interface FestivalWithViews extends Festival {
  views: number;
}

// ✅ 검색 결과 항목 (뷰 포함/미포함 둘 다 수용)
export type FestivalItem = Festival | FestivalWithViews;

// ✅ 검색 파라미터
export type FestivalSearchParams = {
  genre?: string;
  keyword?: string;
  page?: number;
  size?: number;
};
