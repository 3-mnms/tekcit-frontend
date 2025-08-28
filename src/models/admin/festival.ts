export interface FestivalScheduleDTO {
    dayOfWeek: DayOfWeek;
    time: string;
}
export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export interface FestivalDetail {
    fcast: string[]; // 출연진
    ticketPrice: number; // 티켓 가격
    faddress: string; // 공연장 주소
    ticketPick: number; // 티켓수령방법
    maxPurchase: number; // 최대 구매 수량
    prfage: string; // 관람 연령
    prfstate: string; // 공연상태 (예: "공연예정")
    availableNOP: number; // 수용인원
    contentFile: string[]; // 상세 파일
    updatedate: string; // 최종 수정일
    story: string; // 상세정보
    entrpsnmH: string; //기획사
    runningTime: string; 
}

export interface Festival {
    fid: string;
    fname: string;
    fdfrom: string; // 공연 시작일
    fdto: string; // 공연 종료일
    posterFile: string; // 포스터
    fcltynm: string; // 공연장 이름
    genrenm: string; // 장르
    detail: FestivalDetail; //
    schedules: FestivalScheduleDTO[]; // 스케줄 정보
}


export const initialProductData: Festival = {
    fid: '',
    fname: '',
    fdfrom: '',
    fdto: '',
    posterFile: '',
    fcltynm: '',
    genrenm: '',
    detail: {
        fcast: [],
        story: '',
        ticketPrice: 0,
        faddress: '',
        ticketPick: 1,
        maxPurchase: 4,
        prfage: '',
        prfstate: '',
        availableNOP: 0,
        entrpsnmH: '',
        runningTime: '',
        contentFile: [],
        updatedate: '',
    },
    schedules: [],
};

export interface StatsData {
  ticketCount: number; // 현재 예매 수
  totalCapacity: number; // 총 목표 수
  genderRatio: {
    male: number; // 남성 비율 (0.0 ~ 1.0)
    female: number; // 여성 비율 (0.0 ~ 1.0)
  };
  ageDistribution: {
    '10s': number;
    '20s': number;
    '30s': number;
    '40s': number;
    '50s': number;
  };
}


