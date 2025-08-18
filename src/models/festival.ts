export interface FestivalScheduleDTO {
    dayOfWeek: DayOfWeek;
    time: string;
}
export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export type Genrenm =  '대중음악' | '무용' | '뮤지컬' | '연극' | '클래식' | '국악' | '복합'

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
    fid: number;
    fname: string;
    fdfrom: string; // 공연 시작일
    fdto: string; // 공연 종료일
    posterFile: string; // 포스터
    fcltynm: string; // 공연장 이름
    genrenm: Genrenm; // 장르
    detail: FestivalDetail; //
    schedules: FestivalScheduleDTO[]; // 스케줄 정보
}

// export interface Festival {
//     id: number;
//     fname: string; // 페스티벌 이름
//     fdto: string; // 공연 시작일
//     fdfrom: string; // 공연 종료일
//     fcast: string[]; // 출연진
//     businessName: string; // 사업자명
//     genrenm: Genrenm; // 장르
//     fage: string; // 관람 연령
//     fcltynm: string; // 공연장
//     faddress: string; // 공연장 주소
//     festivalSchedules: FestivalScheduleDTO[]; // 요일, 시간
//     runningTime: string; // 러닝타임
//     availableNOP: string; // 수용인원
//     ticketPrice: string; // 티켓 가격
//     maxPurchase: '제한 없음' | '1장' | '2장' | '3장' | '4장'; // 구매 수량
//     fticketPick: '일괄 배송' | '현장 수령(QR)' | '배송&현장 수령(QR)'; // 티켓 수령 방법
//     story: string; // 상세정보 
//     posterFile: File | null; // 포스터
//     contentFile: File[]; // //상세 파일들
//     hostId: number; 
// }

export const initialProductData: Festival = {
    fid: 0,
    fname: '',
    fdfrom: '',
    fdto: '',
    posterFile: '',
    fcltynm: '',
    genrenm: '복합',
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
