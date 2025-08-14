// ✅ 리스트 응답(공연 조회)
export interface Festival {
  fid: string;          // 공연 ID (백엔드 fid)
  prfnm: string;        // 공연명
  prfpdfrom: string;    // 시작일(LocalDate → ISO string)
  prfpdto: string;      // 종료일(LocalDate → ISO string)
  poster: string;       // 포스터 URL
  fcltynm?: string;     // 공연시설명 (리스트/상세 공통으로 올 수 있음)
  genrenm?: string;     // 장르명
  prfstate?: string;    // 공연 상태: "공연중" | "공연예정" | "공연종료" 등 (있으면 받음)
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

// (프로젝트에서 쓰던 뷰 수 포함 버전 유지)
export interface FestivalWithViews extends Festival {
  views: number;
}
