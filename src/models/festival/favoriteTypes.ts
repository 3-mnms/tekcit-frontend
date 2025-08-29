// 관심 상품(즐겨찾기) 관련 타입

/** 서버 응답: POST/DELETE 토글 공통 응답 */
export interface FavoriteToggleResponse {
  liked: boolean; // true=찜됨, false=해제
  count: number;  // 해당 fid 총 찜 수
}

/** 특정 상품에 대한 내 찜 여부 조회 응답 */
export interface LikedFlagResponse {
  liked: boolean;
}

/** 특정 상품 찜 개수 조회 응답 */
export interface FavoriteCountResponse {
  count: number;
}

/** 내 관심 상품 목록의 단일 아이템 (백엔드 DTO에 맞춰 필요시 필드 조정) */
export interface MyFavoriteItem {
  fid: string;
  title: string;
  posterUrl?: string | null;
  likedAt: string; // ISO
}

/** 내 관심 상품 목록 페이지 응답 */
export interface MyFavoritesListResponse {
  total: number;
  page: number;
  size: number;
  items: MyFavoriteItem[];
}
