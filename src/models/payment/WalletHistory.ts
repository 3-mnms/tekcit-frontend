export interface PayHistoryItem {
  id: number;
  date: string;
  description: string;
  amount: string;
}

export const payHistory: PayHistoryItem[] = [
  { id: 1, date: '2025.08.05', description: '포인트 환불 처리', amount: '+3,000원' },
  { id: 2, date: '2025.08.04', description: '페이머니 충전', amount: '+10,000원' },
  { id: 3, date: '2025.08.02', description: '포인트 환불 처리', amount: '+5,000원' },
  { id: 4, date: '2025.08.01', description: '페이머니 충전', amount: '+20,000원' },
];
