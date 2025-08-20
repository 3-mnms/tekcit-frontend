export interface FestivalScheduleDTO {
    dayOfWeek: DayOfWeek;
    time: string;
}
export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export interface Festival {
    id: string;
    fname: string;
    fdfrom: string; // 공연 시작일
    fdto: string; // 공연 종료일
    posterFile: string; // 포스터
    fcltynm: string; // 공연장 이름
    genrenm: string; // 장르
    schedules: FestivalScheduleDTO[]; // 스케줄 정보
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

export const initialProductData: Festival = {
    id: '',
    fname: '',
    fdfrom: '',
    fdto: '',
    posterFile: '',
    fcltynm: '',
    genrenm: '',
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
    schedules: [],
};
