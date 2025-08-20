// src/pages/reservation/TicketOrderPage.tsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './TicketOrderPage.module.css';
import TicketOrderSection from '@/components/reservation/TicketOrderSection';

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const TicketOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { fid } = useParams<{ fid: string }>();

  // ✅ TicketOrderSection에서 올라오는 최소 데이터만 받기
  const handleNext = ({ date, time, quantity }: { date: Date; time: string; quantity: number }) => {
    if (!fid) return; // 안전 가드
    navigate(`/reservation/${fid}/order-info`, {
      state: {
        fid,
        dateYMD: ymd(date),
        time,
        quantity,
      },
    });
  };

  return (
    <div className={styles.page}>
      <section className={styles.leftWrap}>
        <img className={styles.poster} src="https://picsum.photos/1400/1600" alt="공연 포스터" />
        <div className={styles.leftTitleBar}>페스티벌 이름이 여기에!</div>
      </section>

      <div className={styles.right}>
        <TicketOrderSection
          fid={fid}               // ✅ fid 내려주기(선택)
          onNext={handleNext}     // ✅ 콜백 연결
          pricePerTicket={88000}
          maxQuantity={4}
          // selectedDate={new Date()}
        />
      </div>
    </div>
  );
};

export default TicketOrderPage;
