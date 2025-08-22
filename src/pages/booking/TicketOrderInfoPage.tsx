import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styles from './TicketOrderInfoPage.module.css';

import TicketInfoSection from '@/components/booking/TicketInfoSection';
import TicketDeliverySelectSection, { type DeliveryMethod } from '@/components/booking/TicketDeliverySelectSection';
import AddressForm from '@/components/payment/address/AddressForm';
import TicketBookerInfoSection from '@/components/booking/TicketBookerInfoSection';
import OrderConfirmSection from '@/components/booking/OrderConfirmSection';

type NavState = { fid: string; dateYMD: string; time: string; quantity: number };
const UNIT_PRICE = 88000; // 더미

const TicketOrderInfoPage: React.FC = () => {
  const { state } = useLocation() as { state?: NavState };
  const navigate = useNavigate();
  const { fid } = useParams<{ fid: string }>();

  const [method, setMethod] = React.useState<DeliveryMethod>('QR');
  const isPaper = method === 'PAPER';
  const qty = state?.quantity ?? 1;

  // ✅ 받은 state 콘솔에 찍기
  useEffect(() => {
    console.log('넘겨받은 예매 state 👉', state);
  }, [state]);

  const handlePay = () => {
    if (fid) navigate(`/booking/${fid}/pay`, { state });
  };

  return (
    <div className={styles.page}>
      {/* 왼쪽: 정보/수령/배송지 */}
      <div className={styles.leftCol}>
        <TicketInfoSection
          compact
          date={state?.dateYMD}
          time={state?.time}
          quantity={qty}
          unitPrice={UNIT_PRICE}
          className={styles.noScroll}
        />

        <TicketDeliverySelectSection value={method} onChange={setMethod} />

        {isPaper && (
          <section className={styles.noScroll}>
            <AddressForm />
          </section>
        )}
      </div>

      {/* 오른쪽: 예매자 + 총 가격/결제 버튼 */}
      <div className={styles.rightCol}>
        <TicketBookerInfoSection className={styles.noScroll} />
        <OrderConfirmSection
          unitPrice={UNIT_PRICE}
          quantity={qty}
          onPay={handlePay}
          className={styles.noScroll}
        />
      </div>
    </div>
  );
};

export default TicketOrderInfoPage;
