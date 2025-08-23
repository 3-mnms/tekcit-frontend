// src/pages/booking/TicketOrderInfoPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styles from './TicketOrderInfoPage.module.css';

import TicketInfoSection from '@/components/booking/TicketInfoSection';
import TicketDeliverySelectSection, { type DeliveryMethod } from '@/components/booking/TicketDeliverySelectSection';
import AddressForm from '@/components/payment/address/AddressForm';
import TicketBookerInfoSection from '@/components/booking/TicketBookerInfoSection';
import OrderConfirmSection from '@/components/booking/OrderConfirmSection';

import { usePhase2Detail } from '@/models/booking/tanstack-query/useBookingDetail';
import { usePreReservation } from '@/models/booking/tanstack-query/useUser'; // ✅ 예매자 이름용

type NavState = { fid: string; dateYMD: string; time: string; quantity: number; reservationNumber?: string };
const UNIT_PRICE = 88000; // fallback
const RESNO_KEY = 'booking.reservationNumber.v1';

const TicketOrderInfoPage: React.FC = () => {
  const { state } = useLocation() as { state?: Partial<NavState> };
  const navigate = useNavigate();
  const { fid: fidFromPath } = useParams<{ fid: string }>();
  const [sp] = useSearchParams();
  const { data: user } = usePreReservation(true); // ✅ 예매자 이름/연락처 가져오기 (TicketBookerInfoSection도 내부에서 사용)

  const [method, setMethod] = useState<DeliveryMethod>('QR');
  const isPaper = method === 'PAPER';

  // 받은 state 로그
  useEffect(() => {
    console.log('넘겨받은 예매 state 👉', state);
  }, [state]);

  const fid = state?.fid || fidFromPath || '';

  const reservationNumber = useMemo(() => {
    const fromState = state?.reservationNumber;
    const fromQuery = sp.get('resNo') || undefined;
    const fromStorage = sessionStorage.getItem(RESNO_KEY) || undefined;
    const v = fromState || fromQuery || fromStorage;
    if (v) sessionStorage.setItem(RESNO_KEY, v);
    return v;
  }, [state?.reservationNumber, sp]);

  // Phase2 상세 조회
  const { data: detail, isLoading, isError, error } = usePhase2Detail({
    festivalId: fid,
    reservationNumber: reservationNumber ?? '',
  });

  useEffect(() => {
    console.log('[phase2] request →', { festivalId: fid, reservationNumber });
  }, [fid, reservationNumber]);
  useEffect(() => {
    if (detail) console.log('[phase2] detail ←', detail);
    if (isError) console.warn('[phase2] error ←', error);
  }, [detail, isError, error]);

  // 필수 파라미터 없으면 뒤로
  useEffect(() => {
    if (!fid || !reservationNumber) {
      console.warn('[order-info] missing fid or reservationNumber → back');
      navigate(-1);
    }
  }, [fid, reservationNumber, navigate]);

  if (!fid || !reservationNumber) return null;

  // ✅ 화면 표시용 값 매핑 (서버 우선 → state → fallback)
  const display = useMemo(() => {
    const perf = detail?.performanceDate; // "YYYY-MM-DDTHH:mm:ss"
    const [d, tFull] = perf ? perf.split('T') : [state?.dateYMD, state?.time];
    const date = d ?? '';
    const time = (tFull ?? '').slice(0, 5) || state?.time || '';
    const unitPrice = (detail?.ticketPrice ?? state?.quantity ? detail?.ticketPrice : undefined) ?? UNIT_PRICE;
    const quantity = detail?.ticketCount ?? state?.quantity ?? 1;
    const posterUrl = detail?.posterFile; // 서버 필드명에 맞춤
    const title = detail?.festivalName;
    return { posterUrl, title, date, time, unitPrice, quantity };
  }, [detail, state]);

  // ✅ 결제 페이지로 넘길 페이로드 생성 & 로그 + 이동
  const handlePay = () => {
    const payload = {
      bookingId: undefined as string | undefined, // 지금은 없음(필요 시 결제 세션 API에서 받아 세팅)
      festivalId: fid,
      posterUrl: display.posterUrl,
      title: display.title,
      performanceDate: display.date,
      unitPrice: display.unitPrice,
      quantity: display.quantity,
      bookerName: user?.name ?? '', // useUser에서 가져온 이름
      deliveryMethod: method,
      total: display.unitPrice * display.quantity,
      reservationNumber, // 참고용
    };

    console.log('[결제하기 payload → /payment]', payload);

    try {
      // 새로고침 대비 백업(bookingId가 생기면 키에 bookingId를 쓰는 걸 추천)
      sessionStorage.setItem('payment:latest', JSON.stringify(payload));
    } catch {}

    // ❗ 요구사항: BookingPaymentPage로만 이동 (URL: /payment)
    navigate('/payment', { state: payload });
  };

  return (
    <div className={styles.page}>
      {/* 왼쪽: 정보/수령/배송지 */}
      <div className={styles.leftCol}>
        <TicketInfoSection
          compact
          posterUrl={display.posterUrl}
          title={display.title}
          date={display.date}
          time={display.time}
          unitPrice={display.unitPrice}
          quantity={display.quantity}
          className={styles.noScroll}
        />

        <TicketDeliverySelectSection value={method} onChange={setMethod} />

        {isPaper && (
          <section className={styles.noScroll}>
            <AddressForm />
          </section>
        )}

        {isLoading && <p className={styles.noScroll}>상세 불러오는 중…</p>}
        {isError && <p className={styles.noScroll}>상세 불러오기 실패: {(error as any)?.message ?? '에러'}</p>}
      </div>

      {/* 오른쪽: 예매자 + 총 가격/결제 버튼 */}
      <div className={styles.rightCol}>
        <TicketBookerInfoSection className={styles.noScroll} />

        {/* ✅ 안전 값으로 전달 (detail? state? → display로 일원화) */}
        <OrderConfirmSection
          unitPrice={display.unitPrice}
          quantity={display.quantity}
          method={method}
          festivalId={fid}
          posterUrl={display.posterUrl}
          title={display.title}
          performanceDate={display.date}
          bookerName={user?.name ?? ''}
          onPay={handlePay}
        />
      </div>
    </div>
  );
};

export default TicketOrderInfoPage;
