// src/components/booking/TicketPurchasePanel.tsx
import React, { useMemo, useState } from 'react';
import Button from '@/components/common/Button';

type Props = {
  /** 선택된 날짜 (없으면 버튼 비활성화) */
  selectedDate?: Date | null;
  /** 선택된 회차(시간) (없으면 버튼 비활성화) */
  selectedTime?: string | null;
  /** 1매 가격 (원) */
  pricePerTicket: number;
  /** 구매 가능 최대 매수 (예: 재고/인당 제한) */
  maxQuantity: number;
  /** 초기 매수 (기본 1) */
  initialQuantity?: number;
  /** “다음” 클릭 시 상위로 전달할 핸들러 */
  onNext: (payload: {
    date: Date;
    time: string;
    quantity: number;
    totalPrice: number;
  }) => void;
  /** 외부 스타일용 */
  className?: string;
};

const formatPrice = (n: number) =>
  new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(n);

const TicketOrderSection: React.FC<Props> = ({
  selectedDate,
  selectedTime,
  pricePerTicket,
  maxQuantity,
  initialQuantity = 1,
  onNext,
  className = '',
}) => {
  const [quantity, setQuantity] = useState(
    Math.min(Math.max(initialQuantity, 1), Math.max(maxQuantity, 1))
  );

  const totalPrice = useMemo(() => pricePerTicket * quantity, [pricePerTicket, quantity]);

  const isReady =
    !!selectedDate && !!selectedTime && quantity > 0 && maxQuantity > 0 && pricePerTicket >= 0;

  const handleNext = () => {
    if (!isReady || !selectedDate || !selectedTime) return;
    onNext({
      date: selectedDate,
      time: selectedTime,
      quantity,
      totalPrice,
    });
  };

  return (
    <aside
      className={`w-full max-w-full md:max-w-[60%] lg:max-w-[50%] p-[4%] rounded-2xl shadow-md bg-white
      border border-gray-200 box-border ${className}`}
      aria-label="예매 선택 패널"
    >
      {/* 제목 */}
      <h2 className="text-xl font-bold text-gray-900 mb-[2%]">예매 정보</h2>

      {/* 일정 */}
      <div className="grid grid-cols-1 sm:grid-cols-[30%_1fr] gap-y-[2%] gap-x-[4%] items-center w-full">
        <label className="text-gray-600 font-medium">날짜 / 시간</label>
        <div className="text-gray-900">
          {selectedDate ? (
            <>
              <time dateTime={selectedDate.toISOString().slice(0, 10)}>
                {selectedDate.toLocaleDateString('ko-KR')}
              </time>
              {selectedTime ? <span className="ml-[2%]">• {selectedTime}</span> : null}
            </>
          ) : (
            <span className="text-gray-400">날짜와 시간을 선택해 주세요</span>
          )}
        </div>

        {/* 가격(1매) */}
        <label className="text-gray-600 font-medium">가격</label>
        <div className="text-gray-900">
          {pricePerTicket > 0 ? `${formatPrice(pricePerTicket)}원 / 1매` : '—'}
        </div>

        {/* 매수 선택 */}
        <label htmlFor="quantity" className="text-gray-600 font-medium">
          매수 선택
        </label>
        <div className="flex items-center gap-[3%]">
          <select
            id="quantity"
            className="w-[40%] min-w-[30%] p-[2%] border border-gray-300 rounded-lg bg-white"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            aria-label="구매 매수 선택"
          >
            {Array.from({ length: Math.max(maxQuantity, 0) }).map((_, i) => {
              const v = i + 1;
              return (
                <option key={v} value={v}>
                  {v}매
                </option>
              );
            })}
          </select>
          <span className="text-sm text-gray-500">{`최대 ${maxQuantity}매`}</span>
        </div>
      </div>

      {/* 합계 */}
      <div className="mt-[4%] pt-[3%] border-t border-gray-200 flex items-center justify-between">
        <span className="text-gray-600 font-medium">총 결제금액</span>
        <strong className="text-lg text-gray-900">{formatPrice(totalPrice)}원</strong>
      </div>

      {/* 다음 버튼 */}
      <div className="mt-[5%] flex justify-end">
        <Button
          type="button"
          onClick={handleNext}
          disabled={!isReady}
          className={`px-[6%] py-[3%] rounded-2xl ${!isReady ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          다음
        </Button>
      </div>
    </aside>
  );
};

export default TicketOrderSection;
