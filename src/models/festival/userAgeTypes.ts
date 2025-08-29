/** 서버에서 내려주는 사용자 나이(만 나이) */
export type UserAge = number;

/** 필요시 확장용(서버 DTO로 받는 형태를 유지하고 싶을 때) */
export type CheckAgeDTO = {
  age: number;
};
