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
import { usePreReservation } from '@/models/booking/tanstack-query/useUser'; // 예매자 이름/연락처

type NavState = {
  fid: string;
  dateYMD: string;
  time: string;
  quantity: number;
  reservationNumber?: string;
};

// 세션에 사용하는 예약번호 키 (요청대로 B 키만 사용)
const RESNO_KEY = 'reservationId';

const TicketOrderInfoPage: React.FC = () => {
  const { state } = useLocation() as { state?: Partial<NavState> };
  const navigate = useNavigate();
  const { fid: fidFromPath } = useParams<{ fid: string }>();
  const [sp] = useSearchParams();
  const { data: user } = usePreReservation(true);

  const [method, setMethod] = useState<DeliveryMethod>('QR');
  const isPaper = method === 'PAPER';

  // 받은 state 로그
  useEffect(() => {
    console.log('넘겨받은 예매 state 👉', state);
  }, [state]);

  // fid 결정 (state > path 파라미터)
  const fid = state?.fid || fidFromPath || '';

  // 예약번호(reservationId/reservationNumber) 확보: state > query(resNo) > session
  const reservationNumber = useMemo(() => {
    const fromState = state?.reservationNumber;
    const fromQuery = sp.get('resNo') || undefined;
    const fromStorage = typeof window !== 'undefined' ? sessionStorage.getItem(RESNO_KEY) || undefined : undefined;

    const v = fromState || fromQuery || fromStorage;
    if (v && typeof window !== 'undefined') {
      sessionStorage.setItem(RESNO_KEY, v);
    }
    console.log('[session]', RESNO_KEY, '→', fromStorage);
    return v;
  }, [state?.reservationNumber, sp]);

  // Phase2 상세 조회 (fid + reservationNumber)
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

  // 화면 표시용 값 (서버값 우선, 부족하면 state 보조)
  const display = useMemo(() => {
    const perf = detail?.performanceDate; // "YYYY-MM-DDTHH:mm:ss"
    const [d, tFull] = perf ? perf.split('T') : [state?.dateYMD, state?.time];

    const date = d ?? '';
    const time = (tFull ?? '').slice(0, 5) || state?.time || '';

    const unitPrice = (detail?.ticketPrice ?? 0); // 서버값만 사용, 없으면 0
    const quantity = detail?.ticketCount ?? state?.quantity ?? 1;

    const posterUrl = detail?.posterFile;
    const title = detail?.festivalName;

    return { posterUrl, title, date, time, unitPrice, quantity };
  }, [detail, state]);

  // 결제 페이지로 넘길 페이로드 생성 & 로그 + 이동 (/payment)
  const handlePay = () => {
    // bookingId는 reservationNumber를 그대로 사용
    const bookingId = reservationNumber;

    const payload = {
      bookingId,                // ✅ 예약번호 = bookingId
      festivalId: fid,
      posterUrl: display.posterUrl,
      title: display.title,
      performanceDate: display.date,
      performanceTime: display.time, // ✅ 시간 유지
      unitPrice: display.unitPrice,
      quantity: display.quantity,
      bookerName: user?.name ?? '',
      deliveryMethod: method,
    };

    console.log('[결제하기 payload → /payment]', payload);

    // 새로고침 대비 백업 (bookingId가 있으면 그 키로, 없으면 latest)
    try {
      if (bookingId) {
        sessionStorage.setItem(`payment:${bookingId}`, JSON.stringify(payload));
      } else {
        sessionStorage.setItem('payment:latest', JSON.stringify(payload));
      }
      // 예약번호만 별도 키로도 백업 (요청 키)
      sessionStorage.setItem(RESNO_KEY, bookingId ?? '');
    } catch {}

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

        {/* 안전 값으로 전달 */}
        <OrderConfirmSection
          unitPrice={display.unitPrice}
          quantity={display.quantity}
          method={method}
          festivalId={fid}
          posterUrl={display.posterUrl}
          title={display.title}
          performanceDate={display.date}
          performanceTime={display.time}   // ✅ 시간 유지
          bookerName={user?.name ?? ''}
          onPay={handlePay}
        />
      </div>
    </div>
  );
};

export default TicketOrderInfoPage;
