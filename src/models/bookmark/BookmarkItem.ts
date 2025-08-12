export interface BookmarkItem {
  id: number;
  name: string;
}

export interface BookmarkCardProps {
  id: number;
  name: string;
  isBookmarked: boolean; 
  onToggleBookmark: (id: number) => void;
}