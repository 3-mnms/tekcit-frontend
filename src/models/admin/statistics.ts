export interface BookingStatsResponse {
    success: boolean;
    data: {
        performanceDate: string;
        bookingCount: number;
        availableNOP: number;
    }[];
    message: string;
}

export interface UserStatsResponse {
  success: boolean;
  data: {
    totalPopulation: number;
    genderCount: {
      male: number;
      female: number;
    };
    genderPercentage: {
      male: string;
      female: string;
    };
    ageGroupCount: {
      '10대': number;
      '20대': number;
      '30대': number;
      '40대': number;
      '50대 이상': number;
    };
    ageGroupPercentage: {
      '10대': string;
      '20대': string;
      '30대': string;
      '40대': string;
      '50대 이상': string;
    };
  };
  message: string;
}

export interface EntranceStatsResponse {
    success: boolean;
    data: {
        festivalId: string;
        performanceDate: string;
        availableNOP: number;
        checkedInCount: number;
    };
    message: string;
}

