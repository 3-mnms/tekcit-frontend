import React from 'react';
import styles from './PaymentManagement.module.css';
import Layout from '@components/layout/Layout';
import { useAdminHistoryQuery, useAdminTotalAmountQuery } from '@/models/admin/useTekcitPayAdmin'

function CardHeader({ className = '', ...props }: React.ComponentProps<'div'>) {
  return <div className={`${styles.cardHeader} ${className}`} {...props} />;
}
function CardContent({ className = '', ...props }: React.ComponentProps<'div'>) {
  return <div className={`${styles.cardContent} ${className}`} {...props} />;
}

const formatAmount = (amount: number, currency: string) =>
  new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: currency === 'KRW' ? 'KRW' : 'USD',
  }).format(amount);

const formatDateTime = (dateTime: string) =>
  new Date(dateTime).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

const getTransactionTypeText = (type: string) =>
  type === 'DEBIT' ? '입금' : type === 'CREDIT' ? '출금' : type;

const getPayMethodText = (method: string) =>
  method === 'POINT_PAYMENT' ? '포인트 결제' : method;

export default function PaymentManagement() {
  const [page, setPage] = React.useState(0);
  const size = 10;

  const totalQ = useAdminTotalAmountQuery();
  const histQ = useAdminHistoryQuery(page, size);

  const totalBalance = totalQ.data?.availableBalance ?? 0;
  const updatedAt = totalQ.data?.updatedAt ? formatDateTime(totalQ.data.updatedAt) : '';

  const pageResp = histQ.data;
  const rows = pageResp?.content ?? [];

  return (
    <Layout subTitle="계좌 관리">
      <div className={styles.wrapper}>
        <div className={`${styles.card} ${styles.cardAccent} ${styles.statCard}`}>
          <CardHeader>
            <div className={styles.statRow}>
              <div className={styles.statItem}>
                <div className={styles.statLabel}>가용 잔액</div>
                <div className={styles.statValue}>
                  {totalQ.isLoading ? '로딩 중…' : new Intl.NumberFormat('ko-KR').format(totalBalance) + ' 원'}
                </div>
                {updatedAt && <div className={styles.subtle}>업데이트: {updatedAt}</div>}
              </div>
            </div>
          </CardHeader>

          {totalQ.isError && (
            <div className={styles.errorBox}>
              {(totalQ.error as Error)?.message ?? '잔액 조회 중 오류가 발생했어요.'}
            </div>
          )}
        </div>

        <div className={styles.card}>
          <CardHeader>
            <h2 className={styles.cardTitle}>💳 결제 내역</h2>
          </CardHeader>

          {histQ.isError && (
            <div className={styles.errorBox}>
              {(histQ.error as Error)?.message ?? '내역 조회 중 오류가 발생했어요.'}
            </div>
          )}

          <CardContent>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr className={styles.theadRow}>
                    <th className={styles.th}>결제 ID</th>
                    <th className={styles.th}>사용자 ID</th>
                    <th className={styles.th}>금액</th>
                    <th className={styles.th}>날짜</th>
                    <th className={styles.th}>거래 유형</th>
                    <th className={styles.th}>결제 방법</th>
                    <th className={styles.th}>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {histQ.isLoading ? (
                    <tr className={styles.tr}>
                      <td className={styles.td} colSpan={6}>불러오는 중…</td>
                    </tr>
                  ) : rows.length ? (
                    rows.map((payment) => (
                      <tr key={payment.paymentId} className={styles.tr}>
                        <td className={styles.td}>
                          <span className={styles.idChip}>
                            {payment.paymentId.slice(0, 8)}...
                          </span>
                        </td>
                        <td className={`${styles.td} ${styles.muted}`}>
                          {(payment.buyerId)}
                        </td>
                        <td className={`${styles.td} ${styles.amount}`}>
                          {formatAmount(payment.amount, payment.currency)}
                        </td>
                        <td className={`${styles.td} ${styles.muted}`}>
                          {formatDateTime(payment.payTime)}
                        </td>
                        <td className={styles.td}>
                          <span className={`${styles.badge} ${styles.badgeTeal}`}>
                            {getTransactionTypeText(payment.transactionType)}
                          </span>
                        </td>
                        <td className={`${styles.td} ${styles.muted}`}>
                          {getPayMethodText(payment.payMethod)}
                        </td>
                        <td className={styles.td}>
                          <span
                            className={`${styles.badge} ${
                              payment.paymentStatus === 'PAID'
                                ? styles.badgeGreen
                                : styles.badgeGray
                            }`}
                          >
                            {payment.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className={styles.tr}>
                      <td className={styles.empty} colSpan={6}>
                        결제 내역이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.pager}>
              <span className={styles.pagerInfo}>
                {pageResp ? `${pageResp.number + 1} / ${pageResp.totalPages} 페이지` : ''}
              </span>
              <button
                className={styles.pagerBtn}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={!pageResp || pageResp.first}
                type="button"
              >
                이전
              </button>
              <button
                className={styles.pagerBtn}
                onClick={() => setPage((p) => (pageResp ? Math.min(pageResp.totalPages - 1, p + 1) : p))}
                disabled={!pageResp || pageResp.last}
                type="button"
              >
                다음
              </button>
            </div>
          </CardContent>
        </div>
      </div>
    </Layout>
  );
}
