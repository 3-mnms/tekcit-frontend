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
  runtime?: string;
  age?: string;
}