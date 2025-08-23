// src/components/booking/OrderConfirmSection.tsx
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
  performanceTime?: string;  // HH:mm
  bookerName?: string;
  bookingId?: string;        // reservationId가 여기로 올 예정
  className?: string;
};

const RESNO_KEY = 'reservationId';
const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n) + '원';

const OrderConfirmSection: React.FC<Props> = ({
  unitPrice,
  quantity,
  method,
  festivalId,
  posterUrl,
  title,
  performanceDate,
  performanceTime,
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
    // ✅ bookingId 우선순위: props.bookingId > sessionStorage['reservationId']
    const ssResNo =
      (typeof window !== 'undefined' && sessionStorage.getItem(RESNO_KEY)) || undefined;
    const finalBookingId = bookingId ?? ssResNo;

    // 필수 값 체크 (bookingId 없으면 진행 불가)
    if (!finalBookingId) {
      console.warn('[결제하기] bookingId 비어있음: props=', bookingId, 'session=', ssResNo);
      alert('결제 식별자(bookingId)를 찾을 수 없어요. 뒤로 가서 다시 시도해 주세요.');
      return;
    }

    const payload = {
      bookingId: finalBookingId,
      festivalId,
      posterUrl,
      title,
      performanceDate,
      performanceTime,
      unitPrice,
      quantity,
      bookerName,
      deliveryMethod: method,
      total, // 참고로 합계도 같이 넣어둠
    };

    // 디버깅 로그
    console.log('[결제하기 payload → /payment]', payload);

    // 새로고침 대비 저장
    try {
      sessionStorage.setItem(`payment:${finalBookingId}`, JSON.stringify(payload));
      sessionStorage.setItem(RESNO_KEY, finalBookingId); // 예약번호 키에도 최신값 저장
    } catch {}

    // /payment 이동
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
