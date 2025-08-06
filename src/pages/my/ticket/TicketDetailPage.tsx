// TicketDetailPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import TicketInfoCard from '@/components/my/ticket/TicketInfoCard';
import PaymentInfoSection from '@/components/my/ticket/PaymentInfoSection';

const TicketDetailPage: React.FC = () => {
  const { id } = useParams(); // 예매 ID
  // 👉 API 요청으로 상세 정보 fetch 해오면 돼!

  return (
    <div className="w-full p-8">
      <h2 className="text-xl font-bold mb-6">예매내역 확인 · 취소</h2>
      <TicketInfoCard />
      <PaymentInfoSection />
    </div>
  );
};

export default TicketDetailPage;
