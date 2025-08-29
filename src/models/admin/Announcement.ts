export interface Announcement {
  scheduleId: number;
  title: string;
  body: string;
  sendTime: string;
  sent: boolean;
  fid: string;
  startAt: string;
  fname: string;
}

// export interface Props {
//   announcements: Announcement[];
// }

export type NewAnnouncement = Omit<Announcement, 'scheduleId' | 'sent'>;