export type ReviewSort = 'asc' | 'desc';

export interface FestivalReviewRequestDTO {
  reviewContent: string;
}

export interface FestivalReviewResponseDTO {
  reviewId: number;  
  reviewContent: string;
  userId: number;
  userName: string;
  createdAt: string;  // ISO (백엔드 LocalDateTime 직렬화)
  updatedAt: string;
}

export interface ReviewAnalyzeResponseDTO {
  analyzeContent: string;
  positive: number; // 0~100 퍼센트
  negative: number;
  neutral: number;
}

export interface FestivalReviewResultDTO {
  reviews: {
    content: FestivalReviewResponseDTO[];
    totalPages: number;
    totalElements: number;
    number: number;      // 현재 페이지 (0-based)
    size: number;        // 페이지 크기
    first: boolean;
    last: boolean;
    empty: boolean;
  };
  analyze?: ReviewAnalyzeResponseDTO | null;
}
