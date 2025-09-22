// src/pages/payment/BookingPaymentPage.tsx
import { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import type { TossPaymentHandle } from '@/components/payment/pay/TossPayment';
import PaymentInfo from '@/components/payment/pay/PaymentInfo';
import BookingPaymentHeader from '@/components/payment/pay/BookingPaymentHeader';
import ReceiveInfo from '@/components/payment/delivery/ReceiveInfo';
import Spinner from '@/components/common/spinner/Spinner';
import Button from '@/components/common/button/Button';
import PasswordInputModal from '@/components/payment/modal/PasswordInputModal';
import AlertModal from '@/components/common/modal/AlertModal';

import { useAuthStore } from '@/shared/storage/useAuthStore';
import PaymentSection from '@/components/payment/pay/PaymentSection';
import type { CheckoutState, PaymentMethod } from '@/models/payment/types/paymentTypes';
import { createPaymentId } from '@/models/payment/utils/paymentUtils';
import { saveBookingSession } from '@/shared/api/payment/paymentSession';
import { fetchBookingDetail } from '@/shared/api/payment/bookingDetail';

import { completePayment, getReservationStatus, requestPayment } from '@/shared/api/payment/payments';
import { useTokenInfoQuery } from '@/shared/api/useTokenInfoQuery';
import { useReleaseWaitingMutation } from '@/models/waiting/tanstack-query/useWaiting';

import styles from './BookingPaymentPage.module.css';

const DEADLINE_SECONDS = 5 * 60;

const parseYMD = (s?: string) => {
  if (!s) return undefined;
  const t = s.trim().replace(/[./]/g, '-');
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  const d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(t);
  if (isNaN(d.getTime())) return undefined;
  d.setHours(0, 0, 0, 0);
  return d;
};

const combineDateTime = (day?: Date, hhmm?: string | null) => {
  if (!day) return undefined;
  const d = new Date(day);
  if (!hhmm) {
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return d;
  d.setHours(Math.min(23, +m[1] || 0), Math.min(59, +m[2] || 0), 0, 0);
  return d;
};

// 1초 간격으로 최대 15초 폴링
const checkStatusAndNavigate = async (bookingId: string, routeToResult: (ok: boolean) => void) => {
  const POLLING_ATTEMPTS = 15;
  const POLLING_INTERVAL_MS = 1000;

  for (let i = 0; i < POLLING_ATTEMPTS; i++) {
    try {
      const statusRes = await getReservationStatus(bookingId);
      if (statusRes.data === 'COMPLETED' || statusRes.data === 'CONFIRMED') {
        console.log('API 요청 성공: 예약 상태 확인 (완료)');
        routeToResult(true);
        return;
      }
    } catch (e) {
      console.error('API 요청 실패: 예약 상태 확인 중 오류 발생', e);
    }
    await new Promise((r) => setTimeout(r, POLLING_INTERVAL_MS));
  }

  console.error('API 응답 오류: 최대 대기 시간(15초) 초과');
  routeToResult(false);
};

const BookingPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const checkout = state as CheckoutState;

  const unitPrice = checkout?.unitPrice ?? 0;
  const quantity = checkout?.quantity ?? 0;
  const finalAmount = useMemo(() => unitPrice * quantity, [unitPrice, quantity]);
  const orderName = useMemo(() => checkout?.title, [checkout?.title]);
  const festivalIdVal = checkout?.festivalId;

  const [sellerId, setSellerId] = useState<number | null>(null);
  const storeName = useAuthStore((s) => s.user?.name) || undefined;
  const userName = useMemo(() => storeName ?? getNameFromJwt(), [storeName]); // getNameFromJwt는 기존 유틸로 가정

  const tossRef = useRef<TossPaymentHandle>(null);
  const [openedMethod, setOpenedMethod] = useState<PaymentMethod | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [ensuredPaymentId, setEnsuredPaymentId] = useState<string | null>(null);

  const { data: tokenInfo } = useTokenInfoQuery();
  const userId = Number(tokenInfo?.userId);

  const amountToPay = finalAmount ?? checkout.amount;

  const [isTimeUpModalOpen, setIsTimeUpModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(DEADLINE_SECONDS);

  // [수정 1] paymentId는 즉시 생성만 담당 (세션 저장은 분리)
  useEffect(() => {
    if (!paymentId) {
      const id = createPaymentId();
      setPaymentId(id);
      console.log('paymentId 생성:', id);
    }
  }, [paymentId]);

  // [수정 2] sellerId 확보 (기존 로직 유지)
  useEffect(() => {
    (async () => {
      try {
        console.log('API 요청 시작: fetchBookingDetail', {
          festivalId: checkout.festivalId,
          bookingId: checkout.bookingId,
        });
        const res = await fetchBookingDetail({
          festivalId: checkout.festivalId,
          performanceDate: checkout.performanceDate,
          reservationNumber: checkout.bookingId,
        });
        if (!res.success) {
          console.error('API 응답 실패: fetchBookingDetail', res.message);
          throw new Error(res.message || '상세 조회 실패');
        }
        const sid = res.data?.sellerId as number | undefined;
        if (!sid) {
          console.error('API 응답 오류: sellerId 누락', res.data);
          throw new Error('sellerId 누락');
        }
        setSellerId(sid);
        console.log('API 요청 성공: fetchBookingDetail', { sellerId: sid });
      } catch (e) {
        console.error('API 요청 실패: 예매 상세 조회 실패', e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkout?.festivalId, checkout?.performanceDate, checkout?.bookingId]);

  // [수정 3] paymentId + sellerId 준비된 뒤에 세션 저장 (처음 한 번)
  const savedSessionRef = useRef(false);
  useEffect(() => {
    if (savedSessionRef.current) return;
    if (!paymentId || !checkout?.bookingId || !checkout?.festivalId || !sellerId) return;

    console.log('API 요청 시작: saveBookingSession', { paymentId });
    saveBookingSession({
      paymentId,
      bookingId: checkout.bookingId,
      festivalId: checkout.festivalId,
      sellerId,
      amount: finalAmount,
      createdAt: Date.now(),
    });
    savedSessionRef.current = true;
  }, [paymentId, sellerId, checkout?.bookingId, checkout?.festivalId, finalAmount]);

  const releaseMut = useReleaseWaitingMutation();
  const releasedOnceRef = useRef(false);

  const reservationDate = useMemo(() => {
    const day = parseYMD(checkout?.performanceDate);
    return combineDateTime(day, (checkout as any)?.performanceTime ?? null);
  }, [checkout?.performanceDate, (checkout as any)?.performanceTime]);

  const callReleaseOnce = (why: string) => {
    if (releasedOnceRef.current) return;
    if (!checkout?.festivalId || !reservationDate) return;
    releasedOnceRef.current = true;
    releaseMut.mutate({
      festivalId: String(checkout.festivalId),
      reservationDate,
    });
    console.log('[waiting.release] fired:', why, {
      festivalId: checkout.festivalId,
      reservationDate: reservationDate.toISOString(),
    });
  };

  const handleTimeUpModalClose = () => setIsTimeUpModalOpen(false);

  const routeToResult = (ok: boolean) => {
    callReleaseOnce(ok ? 'routeToResult:success' : 'routeToResult:fail');
    navigate(`/payment/booking-result?status=${ok ? 'success' : 'fail'}`);
  };

  const toggleMethod = (m: PaymentMethod) => {
    if (isPaying || remainingSeconds <= 0) return;
    setOpenedMethod((prev) => (prev === m ? null : m));
    setErr(null);
  };

  // [수정 4] handlePostPayment 내부에 try/catch/finally 정리
  const handlePostPayment = async (pid: string) => {
    setIsPaying(true);
    if (!checkout.bookingId) {
      console.error('결제 후 처리 실패: 예약번호가 존재하지 않습니다.');
      setErr('예약번호가 존재하지 않습니다.');
      routeToResult(false);
      return;
    }

    try {
      console.log('API 요청 시작: completePayment', { paymentId: pid });
      await completePayment(pid);
      console.log('API 요청 성공: completePayment');

      // 결제 후 15초 폴링로 상태 확인
      await checkStatusAndNavigate(checkout.bookingId, routeToResult);
    } catch (e) {
      console.error('API 요청 실패: 결제 후 처리', e);
      setErr('결제 후 처리에 실패했습니다. 고객센터에 문의해주세요.');
      routeToResult(false);
    } finally {
      setIsPaying(false);
    }
  };

  const handlePayment = async () => {
    if (!checkout) {
      setErr('결제 정보를 불러오지 못했어요. 처음부터 다시 진행해주세요.');
      return;
    }
    if (!openedMethod) {
      setErr('결제 수단을 선택해주세요.');
      return;
    }
    if (remainingSeconds <= 0) {
      setErr('결제 시간이 만료되었습니다.');
      setIsTimeUpModalOpen(true);
      return;
    }
    if (isPaying) return;

    const ensuredId = ensuredPaymentId ?? paymentId ?? createPaymentId();
    if (!ensuredPaymentId) setEnsuredPaymentId(ensuredId);
    if (!paymentId) setPaymentId(ensuredId);

    if (!Number.isFinite(userId)) {
      setErr('로그인이 필요합니다.');
      return;
    }

    // 결제 시작 플래그
    setIsPaying(true);

    try {
      if (openedMethod === 'wallet') {
        console.log('API 요청 시작: requestPayment (지갑)', { paymentId: ensuredId, userId });
        const dto = {
          paymentId: ensuredId,
          bookingId: checkout.bookingId ?? null,
          festivalId: checkout.festivalId ?? null,
          paymentRequestType: 'POINT_PAYMENT_REQUESTED',
          buyerId: userId!,
          sellerId: sellerId!,
          amount: finalAmount,
          currency: 'KRW',
          payMethod: 'POINT_PAYMENT',
        };
        await requestPayment(dto, userId!);
        console.log('API 요청 성공: requestPayment (지갑)');

        // 지갑은 비밀번호 모달 열고, 이후 onComplete에서 폴링
        setIsPaying(false);
        setIsPasswordModalOpen(true);
        return;
      }

      // 카드(토스) 결제
      console.log('결제 성공 요청 시작');
      await tossRef.current?.requestPay({
        paymentId: ensuredId,
        amount: finalAmount,
        orderName,
        bookingId: checkout.bookingId,
        festivalId: festivalIdVal,
        sellerId: sellerId!,
        complete: async (paymentData) => {
          console.log('Toss complete 콜백:', paymentData?.status);

          if (paymentData?.status === 'success') {
            // 콜백 내에서 후처리를 기다림(중요)
            await handlePostPayment(paymentData.paymentId);
          } else {
            console.error('Toss 결제 실패', paymentData?.message);
            setErr(paymentData?.message || '결제에 실패했습니다.');
            routeToResult(false);
          }

          console.log('결제 성공 요청 종료');
        },
      });

      // requestPay가 정상적으로 끝난 경우, setIsPaying(false)는 handlePostPayment에서 처리됨
    } catch (e) {
      console.error('결제 준비 또는 요청 중 오류가 발생했습니다.', e);
      setErr('결제 준비 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.');
      routeToResult(false);
    } finally {
      // 지갑 흐름은 위에서 false 처리, 카드 흐름은 handlePostPayment에서 false 처리
      // 여기서는 중복 false 방지를 위해 아무 것도 하지 않음
    }
  };

  return (
    <div className={styles.page}>
      <BookingPaymentHeader
        initialSeconds={DEADLINE_SECONDS}
        onTick={(sec) => setRemainingSeconds(sec)}
        onExpire={() => setIsTimeUpModalOpen(true)}
      />

      <div className={styles.container} role="main">
        <section className={styles.left}>
          <div className={styles.sectionContainer}>
            <div className={styles.receiveSection}>
              <h2 className={styles.sectionTitle}>수령 방법</h2>
              <ReceiveInfo rawValue={checkout.deliveryMethod} />
            </div>

            <div>
              <h2 className={styles.sectionTitle}>결제 수단</h2>
              <PaymentSection
                ref={tossRef}
                openedMethod={openedMethod}
                onToggle={toggleMethod}
                amount={finalAmount}
                orderName={orderName}
                errorMsg={err}
                bookingId={checkout.bookingId}
                festivalId={checkout.festivalId}
                sellerId={sellerId}
              />
            </div>
          </div>
        </section>

        <aside className={styles.right}>
          <div className={styles.summaryCard}>
            <PaymentInfo />
          </div>
          <div className={styles.buttonWrapper}>
            {isPaying && <Spinner />}
            <Button
              type="button"
              className={styles.payButton}
              onClick={handlePayment}
              disabled={isPaying}
              aria-busy={isPaying}
            >
              결제하기
            </Button>
          </div>
        </aside>
      </div>

      {isPasswordModalOpen && ensuredPaymentId && Number.isFinite(userId) && (
        <PasswordInputModal
          amount={amountToPay}
          paymentId={ensuredPaymentId}
          userName={userName}
          userId={userId as number}
          onClose={() => setIsPasswordModalOpen(false)}
          onComplete={async () => {
            setIsPasswordModalOpen(false);
            setIsPaying(true);
            console.log('지갑 결제 완료 모달: onComplete 시작');

            // 지갑 결제 후 상태 폴링
            await checkStatusAndNavigate(checkout.bookingId, routeToResult);
            setIsPaying(false);
          }}
        />
      )}

      {isTimeUpModalOpen && (
        <AlertModal
          title="시간 만료"
          onConfirm={() => {
            setIsTimeUpModalOpen(false);
            if (window.opener && !window.opener.closed) {
              window.close();
            }
          }}
          hideCancel
        >
          결제 시간이 만료되었습니다. 다시 시도해주세요.
        </AlertModal>
      )}
    </div>
  );
};

export default BookingPaymentPage;
