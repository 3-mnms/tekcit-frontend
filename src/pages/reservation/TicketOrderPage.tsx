// src/pages/reservation/TicketOrderPage.tsx
import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import styles from './TicketOrderPage.module.css';
import TicketOrderSection from '@/components/reservation/TicketOrderSection';

const parseDate = (s?: string | null) => {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(y!, (m! - 1), d!);
  return isNaN(dt.getTime()) ? null : dt;
};

const TicketOrderPage: React.FC = () => {
  const { fid } = useParams<{ fid: string }>();
  const [sp] = useSearchParams();

  const selectedDate = React.useMemo(() => parseDate(sp.get('date')), [sp]);
  const selectedTime = React.useMemo(() => {
    const t = sp.get('time');
    return t && t.trim() !== '' ? t : null;
  }, [sp]);

  return (
    <div className={styles.page}>
      {/* 왼쪽: 포스터 꽉 채우기 */}
      <section className={styles.posterWrap}>
        <img
          className={styles.poster}
          src="https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1200&auto=format&fit=crop"
          alt="공연 포스터"
        />
      </section>

      {/* 오른쪽: 주문 카드가 세로로 꽉 차도록 */}
      <section className={styles.orderWrap}>
        <div className={styles.orderCard}>
          <TicketOrderSection
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            pricePerTicket={50000}
            maxQuantity={4}
            onNext={({ date, time, quantity, totalPrice }) => {
              console.log('fid:', fid, { date, time, quantity, totalPrice });
              // 다음 단계는 이후에 연결
            }}
          />
        </div>
      </section>
    </div>
  );
};

export default TicketOrderPage;
