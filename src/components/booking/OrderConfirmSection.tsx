import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import type { DeliveryMethod } from '@/components/booking/TicketDeliverySelectSection';
import styles from './OrderConfirmSection.module.css';

type Props = {
  unitPrice: number;
  quantity: number;
  method?: DeliveryMethod;   // 수령 방법
  festivalId?: string;
  posterUrl?: string;
  title?: string;
  performanceDate?: string;  // YYYY-MM-DD
  bookerName?: string;
  bookingId?: string;        // ✅ 포함!
  className?: string;
};

const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n) + '원';

const OrderConfirmSection: React.FC<Props> = ({
  unitPrice,
  quantity,
  method,
  festivalId,
  posterUrl,
  title,
  performanceDate,
  bookerName,
  bookingId,
  className = '',
}) => {
  const navigate = useNavigate();

  const { total } = useMemo(() => {
    const subtotal = unitPrice * quantity;
    return { total: subtotal };
  }, [unitPrice, quantity]);

  const handlePayClick = () => {
    const payload = {
      bookingId,
      festivalId,
      posterUrl,
      title,
      performanceDate,
      unitPrice,
      quantity,
      bookerName,
      deliveryMethod: method,
      total,
    };

    // 1) 디버깅용 출력
    console.log('[결제하기 payload → /payment]', payload);

    // 2) 새로고침 대비 저장 (선택)
    try {
      if (bookingId) {
        sessionStorage.setItem(`payment:${bookingId}`, JSON.stringify(payload));
      } else {
        sessionStorage.setItem('payment:latest', JSON.stringify(payload));
      }
    } catch {}

    // 3) /payment로 이동 (state로도 함께 전달)
    navigate('/payment', { state: payload });
  };

  return (
    <section className={`${styles.section} ${className}`}>
      <h2 className={styles.title}>총 가격</h2>

      <div className={styles.priceBox}>
        <div className={styles.row}>
          <span className={styles.label}>가격 × 수량</span>
          <span className={styles.value}>{fmt(unitPrice)} × {quantity}매</span>
        </div>

        <div className={`${styles.row} ${styles.totalRow}`}>
          <span className={styles.label}>합계</span>
          <span className={styles.total}>{fmt(total)}</span>
        </div>
      </div>

      <Button type="button" onClick={handlePayClick} className={styles.payButton}>
        결제하기
      </Button>
    </section>
  );
};

export default OrderConfirmSection;