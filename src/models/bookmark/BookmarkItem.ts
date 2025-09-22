export type BookmarkItem = {
  fid: string;   
  name: string;
  thumbnailUrl?: string | null;
};

export type BookmarkCardProps = {
  id: string;                
  name: string;
  isBookmarked: boolean;        
  onToggleBookmark: (id: string) => void;
  thumbnailUrl?: string | null;
};
