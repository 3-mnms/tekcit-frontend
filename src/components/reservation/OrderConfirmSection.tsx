// src/components/reservation/OrderConfirmSection.tsx
import React, { useMemo } from 'react';
import Button from '@/components/common/Button';
import type { DeliveryMethod } from '@/components/reservation/TicketDeliverySelectSection';
import styles from './OrderConfirmSection.module.css';

type Props = {
  unitPrice: number;
  quantity: number;
  method?: DeliveryMethod; // 사용하지 않음
  onPay?: () => void;
  className?: string;
};

const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n) + '원';

const OrderConfirmSection: React.FC<Props> = ({
  unitPrice,
  quantity,
  method,
  onPay,
  className = '',
}) => {
  const { total } = useMemo(() => {
    const subtotal = unitPrice * quantity;
    return { total: subtotal }; // 배송비 없음
  }, [unitPrice, quantity]);

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

      <Button type="button" onClick={onPay} className={styles.payButton}>
        결제하기
      </Button>
    </section>
  );
};

export default OrderConfirmSection;
