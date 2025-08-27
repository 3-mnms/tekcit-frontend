export type Relation = 'FAMILY' | 'FRIEND';

/** 백엔드 SuccessResponse 래퍼 (ApiResponseUtil.success 기준) */
export type SuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
};

/** 에러까지 포괄하는 유연한 응답 타입 (프로젝트 공통 관례) */
export type ApiEnvelope<T> =
  | SuccessResponse<T>
  | { success?: false; message?: string; errorCode?: string }
  | T;

/** ==== DTOs ==== */

/** 양도/양수자 공통 사용자 요약 (백엔드 AssignmentDTO) */
export type AssignmentDTO = {
  /** 사용자 이름 */
  name: string;
  /** 주민번호 앞자리 + 뒷자리 첫 자리 (마스킹/가공된 값) */
  residentNum: string;
};

/** ===== 요청 파라미터 ===== */

/** 양수자(받는 사람) 정보 조회: /api/users/transferee?email=... */
export type TransfereeQuery = {
  email: string;
};

/** 양도자(현재 나) 정보 조회: /api/users/transferor (인증 기반) */
export type TransferorQuery = void;

/** ===== 응답 타입 별칭 ===== */

export type TransfereeResponse = SuccessResponse<AssignmentDTO>;
export type TransferorResponse = SuccessResponse<AssignmentDTO>;