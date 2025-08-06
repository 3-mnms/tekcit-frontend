export interface BookmarkCardProps {
  id: number;
  name: string;
  isBookmarked: boolean; 
  onToggleBookmark: (id: number) => void;
}