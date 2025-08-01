export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  time: string; // 예: '1분전', '1일전'
  read: boolean;
}
