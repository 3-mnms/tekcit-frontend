import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styles from './TicketOrderInfoPage.module.css';

import TicketInfoSection from '@/components/booking/TicketInfoSection';
import TicketDeliverySelectSection, { type DeliveryMethod } from '@/components/booking/TicketDeliverySelectSection';
import AddressForm from '@/components/payment/address/AddressForm';
import TicketBookerInfoSection from '@/components/booking/TicketBookerInfoSection';
import OrderConfirmSection from '@/components/booking/OrderConfirmSection';

import { usePhase2Detail, useSelectDelivery } from '@/models/booking/tanstack-query/useBookingDetail'; // ✅ 추가
import { usePreReservation } from '@/models/booking/tanstack-query/useUser';
import { useAuthStore } from '@/shared/storage/useAuthStore';

// ✅ UI → BE 매핑 (API는 그대로!)
import { mapUiToBeDelivery } from '@/models/booking/bookingTypes';

type NavState = {
  fid: string;
  dateYMD: string;
  time: string;
  quantity: number;
  reservationNumber?: string;
};

const RESNO_KEY = 'reservationId';

const TicketOrderInfoPage: React.FC = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { state } = useLocation() as { state?: Partial<NavState> };
  const navigate = useNavigate();
  const { fid: fidFromPath } = useParams<{ fid: string }>();
  const [sp] = useSearchParams();
  const { data: user } = usePreReservation(true);

  const [method, setMethod] = useState<DeliveryMethod>('QR');
  const [address, setAddress] = useState<string>(''); // PAPER 저장용
  const isPaper = method === 'PAPER';

  useEffect(() => {
    console.log('넘겨받은 예매 state 👉', state);
  }, [state]);

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

    const unitPrice = detail?.ticketPrice ?? 0;
    const quantity = detail?.ticketCount ?? state?.quantity ?? 1;

    const posterUrl = detail?.posterFile;
    const title = detail?.festivalName;

    return { posterUrl, title, date, time, unitPrice, quantity };
  }, [detail, state]);

  // 발권/결제 ISO
  const perfDateISO = useMemo(() => {
    if (!display.date || !display.time) return '';
    return `${display.date}T${display.time}:00`;
  }, [display.date, display.time]);

  // PAPER일 때만 로딩/에러 표시
  const showDetailLoading = isPaper && isLoading;
  const showDetailError = isPaper && isError;

  // ✅ 수령방법 저장 훅 (API는 그대로)
  const { mutate: saveDelivery, isPending: isSaving } = useSelectDelivery();

  // ✅ 라디오 변경 → QR은 즉시 저장, PAPER는 주소 제출에서 저장
  const handleMethodChange = (m: DeliveryMethod | null) => {
    const next = m ?? 'QR';
    setMethod(next);
    if (!reservationNumber) return;

    if (next === 'QR') {
      // UI 'QR' -> BE 'MOBILE'
      saveDelivery({
        festivalId: fid,
        reservationNumber,
        deliveryMethod: mapUiToBeDelivery('QR'),
      });
    }
  };

  // ✅ 주소 폼 제출(PAPER 저장)
  const handleAddressSubmit = (addr: string) => {
    const trimmed = (addr || '').trim();
    setAddress(trimmed);
    if (!trimmed || !reservationNumber) return;

    saveDelivery({
      festivalId: fid,
      reservationNumber,
      deliveryMethod: 'PAPER',
      address: trimmed,
    });
  };

  // 결제 이동
  const handlePay = () => {
    const bookingId = reservationNumber;

    const payload = {
      bookingId,
      festivalId: fid,
      posterUrl: display.posterUrl,
      title: display.title,
      performanceDate: perfDateISO,
      unitPrice: display.unitPrice,
      quantity: display.quantity,
      bookerName: user?.name ?? '',
      deliveryMethod: method,                       // 'QR' | 'PAPER' (API 유지)
      address: method === 'PAPER' ? address : undefined,
    };

    try {
      if (bookingId) {
        sessionStorage.setItem(`payment:${bookingId}`, JSON.stringify(payload));
      } else {
        sessionStorage.setItem('payment:latest', JSON.stringify(payload));
      }
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

        {/* 수령 방법 섹션 */}
        <div className={styles.noScroll}>
          <TicketDeliverySelectSection
            value={method}
            onChange={handleMethodChange}   // ✅ API 트리거
            loading={isSaving}              // ✅ 저장 중 비활성
          />
        </div>

        {/* 주소 입력 (PAPER일 때만) */}
        {isPaper && (
          <section className={`${styles.noScroll} ${styles.boxCard} ${styles.addressCard}`}>
            {/* AddressForm이 onSubmit(address: string)을 받는다고 가정 */}
            <AddressForm onSubmit={handleAddressSubmit} />
          </section>
        )}

        {/* PAPER일 때만 로딩/에러 메시지 노출 */}
        {showDetailLoading && <p className={styles.noScroll}>상세 불러오는 중…</p>}
        {showDetailError && (
          <p className={styles.noScroll} aria-live="polite">
            상세 불러오기 실패: {(error as any)?.message ?? '에러'}
          </p>
        )}
      </div>

      {/* 오른쪽: 예매자 + 총 가격/결제 버튼 */}
      <div className={styles.rightCol}>
        <TicketBookerInfoSection className={styles.noScroll} />

        <OrderConfirmSection
          unitPrice={display.unitPrice}
          quantity={display.quantity}
          method={method}
          festivalId={fid}
          posterUrl={display.posterUrl}
          title={display.title}
          performanceDate={display.date}
          performanceTime={display.time}
          reservationNumber={reservationNumber!}
          bookerName={user?.name ?? ''}
          onPay={handlePay}
        />
      </div>
    </div>
  );
};

export default TicketOrderInfoPage;
