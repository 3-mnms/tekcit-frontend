export interface Announcement {
  id: number;
  genre: string;
  title: string;
  content?: string;
  createdAt: string;
}


export interface Props {
  announcements: Announcement[];
}