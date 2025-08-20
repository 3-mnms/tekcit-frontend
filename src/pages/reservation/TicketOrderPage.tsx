import React from 'react';
import styles from './TicketOrderPage.module.css';
import TicketOrderSection from '@/components/reservation/TicketOrderSection';

const TicketOrderPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <section className={styles.leftWrap}>
        <img className={styles.poster} src="https://picsum.photos/1400/1600" alt="공연 포스터" />
        {/* ✅ 포스터 위 제목 */}
        <div className={styles.leftTitleBar}>페스티벌 이름이 여기에!</div>
      </section>

      <div className={styles.right}>
        <TicketOrderSection
          /* API 전이라도 가격/매수 확실히 보이도록 기본값 넘김 */
          pricePerTicket={88000}
          maxQuantity={4}
          /* 필요 시 초기값 */
          // selectedDate={new Date()}
        />
      </div>
    </div>
  );
};

export default TicketOrderPage;
