export interface Announcement {
  fid: string;
  fname: string;
  title: string;
  content?: string;
  startAt: string;
  sentTime: string;
}

export interface Props {
  announcements: Announcement[];
}