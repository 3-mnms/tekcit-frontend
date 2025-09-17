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

// completePayment는 이제 PG 결제 로직에서만 사용됩니다.
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
  const userName = useMemo(() => storeName ?? getNameFromJwt(), [storeName]);

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

  // 최초 paymentId 생성 + 세션 저장
  useEffect(() => {
    if (!paymentId) {
      const id = createPaymentId();
      setPaymentId(id);
      if (checkout?.bookingId && checkout?.festivalId && sellerId) {
        saveBookingSession({
          paymentId: id,
          bookingId: checkout.bookingId,
          festivalId: checkout.festivalId,
          sellerId,
          amount: finalAmount,
          createdAt: Date.now(),
        });
      }
    }
  }, [paymentId, checkout, finalAmount, sellerId]);

  // sellerId 확보
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchBookingDetail({
          festivalId: checkout.festivalId,
          performanceDate: checkout.performanceDate,
          reservationNumber: checkout.bookingId,
        });
        if (!res.success) throw new Error(res.message || '상세 조회 실패');
        const sid = (res.data?.sellerId ?? res.data?.sellerId) as number | undefined;
        if (!sid) throw new Error('sellerId 누락');
        setSellerId(sid);
      } catch (e) {
        // console.error('예매 상세 조회 실패', e)
        // alert('결제 정보를 불러오지 못했습니다.')
        // navigate(-1)
      }
    })();
  }, [checkout?.festivalId, checkout?.performanceDate, checkout?.bookingId, navigate]);

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

  const handlePostPayment = async (paymentId: string) => {
    if (!checkout.bookingId) {
      setErr('예약번호가 존재하지 않습니다.');
      routeToResult(false);
      return;
    }

    try {
      setIsPaying(true);
      await completePayment(paymentId);
      await new Promise(resolve => setTimeout(resolve, 10000));
      const statusRes = await getReservationStatus(checkout.bookingId);

      if (statusRes.data === 'COMPLETED' || statusRes.data === 'CONFIRMED') {
        routeToResult(true);
      } else {
        setErr('예약 처리에 실패했습니다. 고객센터에 문의해주세요.');
        routeToResult(false);
      }
    } catch (e) {
      console.error('결제 후 처리에 실패했습니다.', e);
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

    setIsPaying(true);

    try {
      if (openedMethod === 'wallet') {
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
        setIsPaying(false);
        setIsPasswordModalOpen(true);
        return;
      }

      await tossRef.current?.requestPay({
        paymentId: ensuredId,
        amount: finalAmount,
        orderName,
        bookingId: checkout.bookingId,
        festivalId: festivalIdVal,
        sellerId: sellerId!,
        complete: (paymentData) => {
          if (paymentData.code === null) {
            handlePostPayment(paymentData.paymentId);
          } else {
            setErr(paymentData.message || '결제에 실패했습니다.');
            routeToResult(false);
          }
        },
      });
    } catch (e) {
      console.error('결제 준비 또는 요청 중 오류가 발생했습니다.', e);
      setErr('결제 준비 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.');
      routeToResult(false);
    } finally {
      setIsPaying(false);
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

            // ⭐ 대기 시간을 20초로 늘려서 백엔드 처리 시간을 충분히 확보
            await new Promise(resolve => setTimeout(resolve, 10000));

            try {
              const statusRes = await getReservationStatus(checkout.bookingId);

              if (statusRes.data === 'COMPLETED' || statusRes.data === 'CONFIRMED') {
                routeToResult(true);
              } else {
                setErr('예약 처리에 실패했습니다. 고객센터에 문의해주세요.');
                routeToResult(false);
              }
            } catch (e) {
              console.error('예약 상태 확인에 실패했습니다.', e);
              setErr('예약 상태 확인에 실패했습니다. 고객센터에 문의해주세요.');
              routeToResult(false);
            } finally {
              setIsPaying(false);
            }
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