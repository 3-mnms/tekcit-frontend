export interface Festival {
  id: string;
  prfnm: string;
  fdfrom: string;
  fdto: string;
  poster: string;
  fcltynm: string;
  area: string;
  genrename: string; 
  fid: string;
}

export interface FestivalWithViews extends Festival {
  views: number;
}