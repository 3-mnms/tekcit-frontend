import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styles from './TicketOrderInfoPage.module.css';

import TicketInfoSection from '@/components/booking/TicketInfoSection';
import TicketDeliverySelectSection, { type DeliveryMethod } from '@/components/booking/TicketDeliverySelectSection';
import AddressForm, { type AddressFormHandle } from '@/components/payment/address/AddressForm';
import TicketBookerInfoSection from '@/components/booking/TicketBookerInfoSection';
import OrderConfirmSection from '@/components/booking/OrderConfirmSection';

import { usePhase2Detail, useSelectDelivery } from '@/models/booking/tanstack-query/useBookingDetail';
import { usePreReservation } from '@/models/booking/tanstack-query/useUser';
import Spinner from '@/components/common/spinner/Spinner';
import { mapUiToBeDelivery } from '@/models/booking/bookingTypes';
import { useAuthStore } from '@/shared/storage/useAuthStore';
import { sendLeaveMessage } from '@/shared/config/leave';

type NavState = {
  fid: string;
  dateYMD: string;
  time: string;
  quantity: number;
  reservationNumber?: string;
};

const RESNO_KEY = 'reservationId';

const TicketOrderInfoPage: React.FC = () => {
  const { state } = useLocation() as { state?: Partial<NavState> };
  const navigate = useNavigate();
  const { fid: fidFromPath } = useParams<{ fid: string }>();
  const [sp] = useSearchParams();
  const { data: user, isLoading: isUserLoading } = usePreReservation(true);

  const [method, setMethod] = useState<DeliveryMethod>('QR');
  const isPaper = method === 'PAPER';
  const addrRef = useRef<AddressFormHandle | null>(null);

  const STORE_KEY = import.meta.env.VITE_PORTONE_STORE_KEY;
  const CHANNEL_KEY = import.meta.env.VITE_PORTONE_CHANNEL_KEY;

  const accessToken = useAuthStore((s) => s.accessToken);
  const fid = state?.fid || fidFromPath || '';

  // 예약번호(reservationId/reservationNumber) 확보: state > query(resNo) > session
  const reservationNumber = useMemo(() => {
    const fromState = state?.reservationNumber;
    const fromQuery = sp.get('resNo') || undefined;
    const fromStorage =
      typeof window !== 'undefined' ? sessionStorage.getItem(RESNO_KEY) || undefined : undefined;

    const v = fromState || fromQuery || fromStorage;
    if (v && typeof window !== 'undefined') {
      sessionStorage.setItem(RESNO_KEY, v);
    }
    return v;
  }, [state?.reservationNumber, sp]);

  useEffect(() => {
    if (!fid) return;
    const payload = { festivalId: fid, reservationNumber };
    const onLeave = () =>
      sendLeaveMessage('reservation', payload, { token: accessToken ?? undefined });
    window.addEventListener('pagehide', onLeave);
    window.addEventListener('beforeunload', onLeave);
    return () => {
      onLeave();
      window.removeEventListener('pagehide', onLeave);
      window.removeEventListener('beforeunload', onLeave);
    };
  }, [fid, reservationNumber, accessToken]);

  // Phase2 상세 조회
  const { data: detail, isLoading: isDetailLoading } = usePhase2Detail({
    festivalId: fid,
    reservationNumber: reservationNumber ?? '',
  });

  useEffect(() => {
    if (!fid || !reservationNumber) {
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

  // 서버에서 온 ticketPick(1=둘 다, 2=QR만)
  type DeliveryAvailabilityCode = 1 | 2;
  const availabilityCode: DeliveryAvailabilityCode | null = useMemo(() => {
    const code = detail?.ticketPick;
    return code === 1 || code === 2 ? code : null; // null이면 둘 다 허용 취급
  }, [detail?.ticketPick]);

  // 선택가능 옵션이 달라졌을 때 현재 method 보정 (QR만 가능한데 PAPER면 QR로)
  useEffect(() => {
    if (availabilityCode === 2 && method === 'PAPER') {
      setMethod('QR');
    }
  }, [availabilityCode, method]);

  // 수령방법 저장 훅
  const { mutate: saveDelivery, mutateAsync: saveDeliveryAsync, isPending: isSaving } = useSelectDelivery();

  // 라디오 변경 → QR은 즉시 저장, PAPER는 주소 제출/결제 시 저장
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

  // 결제 이동 (클릭 시점에 최신 주소/수령방법 저장)
  const handlePay = async () => {
    // QR만 가능한데 PAPER면 차단
    if (availabilityCode === 2 && method === 'PAPER') {
      alert('이 공연은 QR 수령만 가능합니다.');
      return;
    }

    // 클릭 시점 최신 주소 추출
    const latestAddress = isPaper ? (addrRef.current?.getAddress() ?? '') : undefined;
    if (isPaper && !latestAddress) {
      alert('지류 티켓은 배송지를 입력해 주세요.');
      return;
    }

    // 결제 직전, 현재 method로 항상 서버 저장(덮어쓰기) → QR도 null 방지
    try {
      await saveDeliveryAsync({
        festivalId: fid,
        reservationNumber: reservationNumber!,
        deliveryMethod: mapUiToBeDelivery(method), // 'QR' → 'MOBILE', 'PAPER' → 'PAPER'
        ...(method === 'PAPER' ? { address: latestAddress! } : {}), // QR이면 address 제외
      });
    } catch (e) {
      console.error('[selectDelivery on pay] failed', e);
      alert('수령방법 저장에 실패했어요. 잠시 후 다시 시도해 주세요.');
      return;
    }

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
      deliveryMethod: method, // 'QR' | 'PAPER'
      address: latestAddress, // PAPER일 때만 값 존재
      STORE_KEY,
      CHANNEL_KEY,
    };

    try {
      if (bookingId) {
        sessionStorage.setItem(`payment:${bookingId}`, JSON.stringify(payload));
      } else {
        sessionStorage.setItem('payment:latest', JSON.stringify(payload));
      }
      sessionStorage.setItem(RESNO_KEY, bookingId ?? '');
    } catch {
      /* ignore */
    }

    navigate('/payment', { state: payload });
  };

  const booting = isUserLoading || isDetailLoading;

  if (booting) {
    return <Spinner />; // 화면 전체 오버레이
  }

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
            onChange={handleMethodChange} // QR 선택 시 즉시 저장
            loading={isSaving}
            availabilityCode={availabilityCode} // 1=둘 다, 2=QR만
          />
        </div>

        {/* 주소 입력 (PAPER일 때만) */}
        {isPaper && (
          <section className={`${styles.noScroll} ${styles.boxCard} ${styles.addressCard}`}>
            {/* ref로 현재 주소를 “결제 시점”에 가져온다 */}
            <AddressForm ref={addrRef} />
          </section>
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
