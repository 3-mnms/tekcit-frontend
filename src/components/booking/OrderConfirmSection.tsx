// src/components/booking/OrderConfirmSection.tsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/button/Button';
import type { DeliveryMethod } from '@/components/booking/TicketDeliverySelectSection';
import styles from './OrderConfirmSection.module.css';
import Spinner from '@/components/common/spinner/Spinner';

import {
  apiReserveTicket,
  apiSelectDelivery,
  mapUiDeliveryToBE,
  type IssueQrRequest,
} from '@api/booking/bookingApi';

type Props = {
  unitPrice: number;
  quantity: number;
  method?: DeliveryMethod;          // 'QR' | 'PAPER'
  festivalId?: string;
  posterUrl?: string;
  title?: string;
  performanceDate?: string;         // YYYY-MM-DD
  performanceTime?: string;         // HH:mm
  bookerName?: string;

  /** ✅ 기존 호환: bookingId | reservationNumber 둘 다 허용 */
  bookingId?: string;               // reservationId(=reservationNumber)
  reservationNumber?: string;       // alias

  /** ✅ 지류 배송 주소 */
  address?: string;

  className?: string;

  /** ✅ 페이지에서 외부로 결제 흐름을 제어하려면 전달 (있으면 내부 API는 스킵) */
  onPay?: () => void;
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
  reservationNumber,
  address,              // ✅ 추가
  className = '',
  onPay,                // ✅ 추가
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { total } = useMemo(() => {
    const subtotal = (unitPrice || 0) * (quantity || 0);
    return { total: subtotal };
  }, [unitPrice, quantity]);

  const handlePayClick = async () => {
    // ✅ 외부 핸들러가 오면 내부 로직은 건너뜀
    if (onPay) {
      onPay();
      return;
    }

    // bookingId 우선순위: props.bookingId > props.reservationNumber > sessionStorage['reservationId']
    const ssResNo =
      (typeof window !== 'undefined' && sessionStorage.getItem(RESNO_KEY)) || undefined;
    const finalBookingId = bookingId ?? reservationNumber ?? ssResNo;

    if (!finalBookingId) {
      console.warn('[결제하기] bookingId 비어있음:', { bookingId, reservationNumber, ssResNo });
      alert('결제 식별자(bookingId)를 찾을 수 없어요. 뒤로 가서 다시 시도해 주세요.');
      return;
    }
    if (!festivalId) {
      alert('공연 식별자(festivalId)가 없어요.');
      return;
    }

    const performanceDateTime = toLocalDateTimeISO(performanceDate, performanceTime);
    if (!performanceDateTime) {
      alert('공연 시작시간 형식이 올바르지 않아요.');
      return;
    }

    // ✅ 결제 페이지로 넘길 payload (시간 포함 / total 제거)
    const payload = {
      bookingId: finalBookingId,
      festivalId,
      posterUrl,
      title,
      performanceDate: performanceDateTime, // full datetime
      unitPrice,
      quantity,
      bookerName,
      deliveryMethod: method ?? 'QR',
      address: method === 'PAPER' ? (address ?? '') : undefined, // ✅ 주소 포함
    };

    try {
      sessionStorage.setItem(`payment:${finalBookingId}`, JSON.stringify(payload));
      sessionStorage.setItem(RESNO_KEY, finalBookingId);
      sessionStorage.setItem('payment:last', JSON.stringify(payload));
    } catch {}

    if (loading) return;
    setLoading(true);

    try {
      // 1) 수령방법/주소 먼저 설정
      const delivery = mapUiDeliveryToBE((method ?? 'QR') as 'QR' | 'PAPER'); // 'QR' -> 'MOBILE'
      console.time('[selectDelivery]');
      await apiSelectDelivery({
        festivalId: festivalId!,
        reservationNumber: String(finalBookingId),
        deliveryMethod: delivery,                         // 'MOBILE' | 'PAPER'
        ...(delivery === 'PAPER' && address ? { address } : {}), // ✅ 지류면 주소 전달
      });
      console.timeEnd('[selectDelivery]');

      // 2) QR 발권 (서버가 PAPER여도 동일 엔드포인트 사용한다고 가정)
      const req: IssueQrRequest = {
        festivalId: festivalId!,
        reservationNumber: String(finalBookingId),
        performanceDate: performanceDateTime, // ex) "2025-09-23T17:00:00"
      };
      console.time('[reserveTicket]');
      await apiReserveTicket(req);
      console.timeEnd('[reserveTicket]');

      navigate('/payment', { state: payload });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { errorMessage?: string; message?: string } } };
      console.error('[발권 실패] /booking/selectDeliveryMethod 또는 /booking/qr', err?.response?.data || e);
      alert(err?.response?.data?.errorMessage || err?.response?.data?.message || '발권에 실패했어요. 잠시 후 다시 시도해 주세요.');
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

      {loading && <Spinner />}

      <Button
        type="button"
        onClick={handlePayClick}
        className={styles.payButton}
        disabled={loading}
      >
        결제하기
      </Button>
    </section>
  );
};

export default OrderConfirmSection;
