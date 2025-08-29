// src/models/statistics/statisticsTypes.ts

/** 백엔드 StatisticsUserResponseDTO 와 1:1 매핑 */
export interface StatisticsUser {
  /** 총 예매자 수 */
  totalPopulation: number;

  /** 성별 예매자 수: { male: 25, female: 25 } 또는 { 남: 25, 여: 25 } 등 */
  genderCount: Record<string, number>;

  /** 성별 비율(%): { male: "50.00%", female: "50.00%" } 등 */
  genderPercentage: Record<string, string>;

  /** 연령대별 예매자 수: { "10대": 5, "20대": 20, ... } */
  ageGroupCount: Record<string, number>;

  /** 연령대별 비율(%): { "10대": "10.00%", "20대": "40.00%", ... } */
  ageGroupPercentage: Record<string, string>;
}
