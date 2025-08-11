export interface FestivalScheduleDTO {
    dayOfWeek: string;
    time: string;
}

export interface ProductType {
    id: number;
    fname: string; // 페스티벌 이름
    fcast: string[]; // 출연진
    businessName: string; // 사업자명
    genrenm: string; // 장르
    fage: string; // 관람 연령
    fcltynm: string; // 공연장
    faddress: string; // 공연장 주소
    fdto: string; // 공연 시작일
    fdfrom: string; // 공연 종료일
    festivalSchedules: FestivalScheduleDTO[]; // 요일, 시간
    runningTime: string; // 러닝타임
    availableNOP: string; // 수용인원
    ticketPrice: string; // 티켓 가격
    maxPurchase: '제한 없음' | '1장' | '2장' | '3장' | '4장'; // 구매 수량
    fticketPick: '일괄 배송' | '현장 수령(QR)' | '배송&현장 수령(QR)'; // 티켓 수령 방법
    story: string; // 상세정보 
    posterFile: File | null; // 포스터
    contentFile: File[]; // //상세 파일들
    hostId: number; 
}

export const initialProductData: ProductType = {
    id: 0,
    fname: '',
    fcast: [],
    businessName: '',
    genrenm: '',
    fage: '',
    fcltynm: '',
    faddress: '',
    fdto: '',
    fdfrom: '',
    festivalSchedules: [],
    runningTime: '',
    availableNOP: '', 
    ticketPrice: '',
    maxPurchase: '제한 없음',
    fticketPick: '일괄 배송',
    story: '',
    posterFile: null,
    contentFile: [],
    hostId: 0,
};

