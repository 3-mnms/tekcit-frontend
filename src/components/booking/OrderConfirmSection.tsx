// src/components/booking/OrderConfirmSection.tsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import type { DeliveryMethod } from '@/components/booking/TicketDeliverySelectSection';
import styles from './OrderConfirmSection.module.css';
import { apiReserveTicket } from '@api/booking/bookingApi';

type Props = {
  unitPrice: number;
  quantity: number;
  method?: DeliveryMethod;         // 'QR' | 'PAPER'
  festivalId?: string;
  posterUrl?: string;
  title?: string;
  performanceDate?: string;        // YYYY-MM-DD
  performanceTime?: string;        // HH:mm
  bookerName?: string;
  bookingId?: string;              // reservationId(=reservationNumber)
  className?: string;
};

const toLocalDateTimeISO = (dateYmd?: string, timeHm?: string) => {
  if (!dateYmd || !timeHm) return undefined;
  const hhmmss = timeHm.length === 5 ? `${timeHm}:00` : timeHm; // HH:mm:ss 보장
  return `${dateYmd}T${hhmmss}`;
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
  const [loading, setLoading] = useState(false);

  const { total } = useMemo(() => {
    const subtotal = unitPrice * quantity;
    return { total: subtotal };
  }, [unitPrice, quantity]);

  const handlePayClick = async () => {
    // bookingId 우선순위: props.bookingId > sessionStorage['reservationId']
    const ssResNo =
      (typeof window !== 'undefined' && sessionStorage.getItem(RESNO_KEY)) || undefined;
    const finalBookingId = bookingId ?? ssResNo;

    if (!finalBookingId) {
      console.warn('[결제하기] bookingId 비어있음: props=', bookingId, 'session=', ssResNo);
      alert('결제 식별자(bookingId)를 찾을 수 없어요. 뒤로 가서 다시 시도해 주세요.');
      return;
    }
    if (!festivalId) {
      alert('공연 식별자(festivalId)가 없어요.');
      return;
    }

    const performanceDateTime = toLocalDateTimeISO(performanceDate, performanceTime);
    console.log("date랑 시간 : ", performanceDateTime);
    if (!performanceDateTime) {
      alert('공연 시작시간 형식이 올바르지 않아요.');
      return;
    }

    // 결제/확인 화면에서도 쓸 payload
    const payload = {
      bookingId: finalBookingId,
      festivalId,
      posterUrl,
      title,
      performanceDate,           // YYYY-MM-DD
      performanceTime,           // HH:mm
      unitPrice,
      quantity,
      bookerName,
      deliveryMethod: method ?? 'QR',
      total,
    };

    // 새로고침 대비 저장
    try {
      sessionStorage.setItem(`payment:${finalBookingId}`, JSON.stringify(payload));
      sessionStorage.setItem(RESNO_KEY, finalBookingId);
    } catch {}

    // ✅ 최종 발권 API 요청 바디 (누락되었던 필드 추가!)
    const req = {
      festivalId: festivalId,
      reservationNumber: String(finalBookingId),
      performanceDate: performanceDateTime, // ex) "2025-09-23T17:00:00"
      ticketCount: Number.isFinite(quantity) ? Number(quantity) : 1,
      deliveryMethod: (method ?? 'QR') as 'QR' | 'PAPER',
    };

    console.log('[apiReserveTicket req]', req);

    // ✅ 발권 API 호출 → 성공 시 /payment 이동
    try {
      if (loading) return;
      setLoading(true);

      await apiReserveTicket(req); // bookingApi.ts의 강화된 버전과 호환

      navigate('/payment', { state: payload });
    } catch (e: any) {
      console.error('[발권 실패] /booking/qr', e?.response?.data || e);
      alert(e?.response?.data?.message || '발권에 실패했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
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

      <Button
        type="button"
        onClick={handlePayClick}
        className={styles.payButton}
        disabled={loading}
      >
        {loading ? '처리 중…' : '결제하기'}
      </Button>
    </section>
  );
};

export default OrderConfirmSection;
