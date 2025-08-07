export interface Festival {
  id: string;
  fname: string;
  fdfrom: string;
  fdto: string;
  poster: string;
  fcltynm: string;
  area: string;
  genrename: string; 
}

export interface FestivalWithViews extends Festival {
  views: number;
}