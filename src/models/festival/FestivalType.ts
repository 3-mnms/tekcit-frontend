export interface Festival {
  fcltynm: string;
  fid: string;
  genrenm: string; 
  poster: string;
  prfnm: string;
  prfpdfrom: string;
  prfpdto: string;
}

export interface FestivalWithViews extends Festival {
  views: number;
}

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
  runningTime: string;    // 백 JSON은 runningtime → API에서 매핑
  contentFiles: string[];
}