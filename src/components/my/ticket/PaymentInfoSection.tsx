import React from 'react';
import styles from './PaymentInfoSection.module.css';

const PaymentInfoSection: React.FC = () => {
  return (
    <div>
      {/* 카드 밖으로 빼기 */}
      <h3 className={styles.title}>결제내역</h3>

      <div className={styles.wrapper}>
        <table className={styles.sharedTable}>
          <colgroup>
            <col style={{ width: '16.6%' }} />
            <col style={{ width: '16.6%' }} />
            <col style={{ width: '16.6%' }} />
            <col style={{ width: '16.6%' }} />
            <col style={{ width: '16.6%' }} />
            <col style={{ width: '16.6%' }} />
          </colgroup>
          <thead>
            <tr>
              <th>예매일</th>
              <th>결제수단</th>
              <th>현재상태</th>
              <th>결제상태</th>
              <th>예매번호</th>
              <th>가격</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2025.07.01</td>
              <td>무통장 입금</td>
              <td>예매</td>
              <td>결제</td>
              <td>A123456</td>
              <td>110,000원</td>
            </tr>
          </tbody>
        </table>

        <div className={styles.paymentSummary}>
          <div className={styles.row}>
            <span>예매 수수료</span>
            <span>1,000원</span>
          </div>
          <div className={styles.row}>
            <span>배송비</span>
            <span>2,500원</span>
          </div>
          <div className={`${styles.row} ${styles.total}`}>
            <span>총 결제금액</span>
            <span>113,500원</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInfoSection;