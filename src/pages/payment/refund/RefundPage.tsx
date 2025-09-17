import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styles from './RefundPage.module.css';

import Header from '@/components/common/header/Header';
import Button from '@/components/common/Button';
import AlertModal from '@/components/common/modal/AlertModal';
import { refundPayment } from '@/shared/api/payment/refund';

const RefundPage: React.FC = () => {
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [loadingRefund, setLoadingRefund] = useState(false);

  const navigate = useNavigate();
  const { paymentId: paymentIdFromPath } = useParams<{ paymentId: string }>();
  const location = useLocation();

  const krw = (n: number) => `${(n ?? 0).toLocaleString('ko-KR')}원`;

  const {
    paymentId: statePaymentId,
    paymentAmount,
    quantity,
    unitPrice,
  } = (location.state || {}) as {
    paymentId?: string;
    paymentAmount?: number;
    title?: string;
    date?: string;
    quantity?: number;
    unitPrice?: number;
  };

  const paymentId = paymentIdFromPath || statePaymentId || '';
  const amount = paymentAmount ?? 0;
  const qty = quantity ?? 1;
  const perPrice = unitPrice ?? (amount && qty ? Math.floor(amount / qty) : 0);

  const routeToResult = useCallback(
    (ok: boolean) => {
      const q = new URLSearchParams({
        type: 'refund',
        status: ok ? 'success' : 'fail',
      }).toString();
      navigate(`/payment/result?${q}`);
    },
    [navigate]
  );

  const handleCancel = () => navigate(-1);
  const handleRefundClick = () => setIsRefundModalOpen(true);

  const handleRefundConfirm = async () => {
    setIsRefundModalOpen(false);
    setLoadingRefund(true);
    try {
      if (!paymentId) throw new Error('paymentId 누락');
      const response = await refundPayment(paymentId);
      routeToResult(Boolean(response?.success));
    } catch {
      routeToResult(false);
    } finally {
      setLoadingRefund(false);
    }
  };

  const handleRefundModalCancel = () => setIsRefundModalOpen(false);

  return (
    <>
      <Header />
      <div className={styles.page} aria-busy={loadingRefund}>
        <header className={styles.header}>
          <h1 className={styles.title}>취소 요청</h1>
          <p className={styles.subtitle}>환불 내용을 확인한 뒤 진행해 주세요.</p>
        </header>

        {/* 환불 대상 카드 (충전 페이지와 통일) */}
        <section className={styles.card} aria-label="환불 대상 정보">
          <div className={styles.cardHeader}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary-dark)' }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <h2 className={styles.cardHeaderTitle}>환불 대상</h2>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>티켓 매수</span>
            <span className={styles.value}>{qty}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>티켓 가격</span>
            <span className={`${styles.value} ${styles.ticketPrice}`}>{krw(perPrice)}</span>
          </div>
        </section>

        {/* 최종 환불 금액 카드 (충전 페이지와 통일) */}
        <section className={styles.card} aria-label="최종 환불 금액">
          <div className={styles.finalAmount}>
            <h2 className={styles.finalAmountLabel}>최종 환불 예정 금액</h2>
            <div className={styles.finalAmountValue}>{krw(amount)}</div>
            <p className={styles.notice}>
              환불은 결제 수단에 따라 영업일 기준 3~5일 소요될 수 있습니다.
            </p>
          </div>
        </section>

        <div className={styles.actions} role="group" aria-label="환불 진행">
          <Button
            className={`${styles.button} ${styles.cancelButton}`}
            onClick={handleCancel}
            disabled={loadingRefund}
          >
            환불 취소
          </Button>
          <Button
            className={`${styles.button} ${styles.refundButton}`}
            onClick={handleRefundClick}
            disabled={loadingRefund || !paymentId}
            aria-busy={loadingRefund}
          >
            {loadingRefund ? '처리 중…' : '환불'}
          </Button>
        </div>

        {isRefundModalOpen && (
          <AlertModal
            title="환불 확인"
            onCancel={handleRefundModalCancel}
            onConfirm={handleRefundConfirm}
            confirmText="확인"
            cancelText="취소"
          />
        )}
      </div>
    </>
  );
};

export default RefundPage;