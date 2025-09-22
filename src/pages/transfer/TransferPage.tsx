// src/pages/mypage/ticket/transfer/TransferPage.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './TransferPage.module.css';
import TransferTicketInfo from '@/components/transfer/TransferTicketInfo';
import TransferRefundGuide from '@/components/transfer/TransferRefundGuide';
import TransferRecipientForm from '@/components/transfer/TransferRecipientForm';
import { TRANSFER_DONE_EVENT } from '@/pages/my/ticket/TransferTicketPage';

const TransferPage: React.FC = () => {
  const navigate = useNavigate();
  const { reservationNumber } = useParams<{ reservationNumber: string }>();

  if (!reservationNumber) {
    return <div className={styles.wrap}>예약번호가 없어요. 목록에서 다시 시도해 주세요.</div>;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.page}>
        <section className={`${styles.col} ${styles.info}`}>
          <TransferTicketInfo reservationNumber={reservationNumber} />
        </section>

        <section className={`${styles.col} ${styles.guide}`}>
          <TransferRefundGuide />
        </section>

        <section className={`${styles.col} ${styles.form}`}>
          <TransferRecipientForm
            reservationNumber={reservationNumber}
            onNext={() => {
              window.dispatchEvent(new CustomEvent(TRANSFER_DONE_EVENT, { detail: reservationNumber }));
              navigate('/mypage/ticket/transfer');
            }}
          />
        </section>
      </div>
    </div>
  );
};

export default TransferPage;
