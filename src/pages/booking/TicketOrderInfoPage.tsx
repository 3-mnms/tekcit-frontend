import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styles from './TicketOrderInfoPage.module.css';

import TicketInfoSection from '@/components/booking/TicketInfoSection';
import TicketDeliverySelectSection, { type DeliveryMethod } from '@/components/booking/TicketDeliverySelectSection';
import AddressForm from '@/components/payment/address/AddressForm';
import TicketBookerInfoSection from '@/components/booking/TicketBookerInfoSection';
import OrderConfirmSection from '@/components/booking/OrderConfirmSection';

import { usePhase2Detail } from '@/models/booking/tanstack-query/useBookingDetail';

type NavState = { fid: string; dateYMD: string; time: string; quantity: number; reservationNumber?: string };
const UNIT_PRICE = 88000; // fallback

const RESNO_KEY = 'booking.reservationNumber.v1';

const TicketOrderInfoPage: React.FC = () => {
  const { state } = useLocation() as { state?: Partial<NavState> };
  const navigate = useNavigate();
  const { fid: fidFromPath } = useParams<{ fid: string }>();
  const [sp] = useSearchParams();

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

  // 없으면 뒤로
  useEffect(() => {
    if (!fid || !reservationNumber) {
      console.warn('[order-info] missing fid or reservationNumber → back');
      navigate(-1);
    }
  }, [fid, reservationNumber, navigate]);

  if (!fid || !reservationNumber) return null;

  // ✅ 화면 표시용 값 매핑 (timezone 이슈 피하려고 문자열 split 사용)
  const display = useMemo(() => {
    const perf = detail?.performanceDate; // "YYYY-MM-DDTHH:mm:ss"
    const [d, tFull] = perf ? perf.split('T') : [state?.dateYMD, state?.time];
    const date = d ?? '';
    const time = (tFull ?? '').slice(0, 5) || state?.time || '';
    const unitPrice = detail?.ticketPrice ?? UNIT_PRICE;
    const quantity = detail?.ticketCount ?? state?.quantity ?? 1;
    return {
      posterUrl: detail?.posterFile,
      title: detail?.festivalName,
      date,
      time,
      unitPrice,
      quantity,
    };
  }, [detail, state]);

  const handlePay = () => {
    navigate(`/booking/${fid}/pay`, { state: { ...state, reservationNumber } });
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
          // venue는 전달 안 함 (요청대로 위치 제외)
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
        <OrderConfirmSection
          unitPrice={display.unitPrice}
          quantity={display.quantity}
          onPay={handlePay}
          className={styles.noScroll}
        />
      </div>
    </div>
  );
};

export default TicketOrderInfoPage;
