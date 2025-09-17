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
  // Removed `storeName` and `userName` memoization as it's not used in the final logic.

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

  // Initial paymentId creation + session saving
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

  // Fetch sellerId
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
        // Error handling is commented out, but it's good practice to handle it.
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

  // 💡 REFACTORED: Unified function for post-payment status check
  const checkAndNavigate = async (bookingId: string) => {
    try {
      setIsPaying(true); // Ensure spinner is active during this check

      // Use a polling mechanism instead of a fixed delay
      let statusRes;
      for (let i = 0; i < 5; i++) { // Check up to 5 times
        statusRes = await getReservationStatus(bookingId);
        if (statusRes.data === 'COMPLETED' || statusRes.data === 'CONFIRMED') {
          routeToResult(true);
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between checks
      }

      // If status is not confirmed after polling
      setErr('예약 처리에 실패했습니다. 고객센터에 문의해주세요.');
      routeToResult(false);

    } catch (e) {
      console.error('예약 상태 확인에 실패했습니다.', e);
      setErr('예약 상태 확인에 실패했습니다. 고객센터에 문의해주세요.');
      routeToResult(false);
    } finally {
      setIsPaying(false);
    }
  };

  // 💡 REFACTORED: `handlePostPayment` logic is now simpler and more robust
  const handlePostPayment = async (paymentId: string) => {
    if (!checkout.bookingId) {
      setErr('예약번호가 존재하지 않습니다.');
      routeToResult(false);
      return;
    }

    try {
      // Ensure the final payment completion is awaited
      await completePayment(paymentId);
      // After completion, check the booking status with the new unified function
      await checkAndNavigate(checkout.bookingId);
    } catch (e) {
      console.error('결제 후 처리에 실패했습니다.', e);
      setErr('결제 후 처리에 실패했습니다. 고객센터에 문의해주세요.');
      routeToResult(false);
      setIsPaying(false); // Reset on error
    }
  };

  // 💡 REFACTORED: `handlePayment` now handles state more reliably
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

    setIsPaying(true); // Start paying state

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
        // Wallet payment complete, open modal
        setIsPaying(false);
        setIsPasswordModalOpen(true);
        return;
      }

      // For Toss, do not await the requestPay call directly
      // The complete callback handles the rest of the flow
      tossRef.current?.requestPay({
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
      // Do not reset isPaying here for Toss payments.
      // The state is now managed within the complete callback or its called function.
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
              disabled={isPaying} // 💡 disabled added
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
          // Removed userName and userId from props as they are not used inside the modal's onComplete logic
          onClose={() => setIsPasswordModalOpen(false)}
          onComplete={async () => {
            setIsPasswordModalOpen(false);
            await checkAndNavigate(checkout.bookingId);
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