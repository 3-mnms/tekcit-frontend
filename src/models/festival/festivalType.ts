export interface Festival {
  fcltynm: string;
  fid: string;
  genrenm: string;
  poster: string;
  prfnm: string;
  prfpdfrom: string; // YYYY-MM-DD
  prfpdto: string;   // YYYY-MM-DD
}

export interface FestivalWithViews extends Festival {
  views: number;
}

export type WeekKey = 'SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT';

export interface FestivalDetail extends Festival {
  fcast: string;
  prfage: string;
  story: string;
  ticketPrice: number;
  availableNOP: number;
  prfstate: string;
  faddress: string;
  maxPurchase: number;
  entrpsnmH: string;
  runningTime: string;     // 백 JSON이 runningtime 여도 API층에서 매핑된다 가정
  contentFiles: string[];

  // ⬇️ 백엔드 응답 (그대로 유지)
  times: string[];         // ["16:00","12:00","16:00","16:00"] (daysOfWeek와 index-매칭)
  daysOfWeek: string[];    // ["FRI","SAT","SAT","SUN"]

  // ⬇️ 프론트에서 select 가공으로 추가되는 파생 필드
  timesByDow?: Record<WeekKey, string[]>; // { FRI:["20:00"], SAT:["17:00","12:00"], ... }
}
