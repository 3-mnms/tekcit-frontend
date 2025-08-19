// src/pages/booking/TicketOrderPage.tsx
import React, { useState } from 'react';
import TicketOrderSection from '@/components/booking/TicketOrderSection';

const TicketOrderPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row gap-[4%] p-[5%]">
      {/* 왼쪽: 티켓 주문 섹션 */}
      <TicketOrderSection
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        pricePerTicket={88000}
        maxQuantity={4}
        onNext={({ date, time, quantity, totalPrice }) => {
          console.log('선택한 값:', { date, time, quantity, totalPrice });
          // ✅ 다음 단계로 이동 (좌석 선택 / 결제 등)
        }}
        className="flex-1"
      />

      {/* 오른쪽: 좌석 선택, 공연 상세, 스케줄 등 */}
      <div className="flex-1 border border-gray-200 rounded-2xl p-[3%]">
        <h2 className="text-lg font-bold mb-[2%]">좌석 선택 or 공연 정보</h2>
        {/* 👉 여기에 스케줄/좌석 컴포넌트 추가 */}
      </div>
    </div>
  );
};

export default TicketOrderPage;
