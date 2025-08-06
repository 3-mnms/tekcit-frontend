import React from 'react';
import styles from './PaymentInfoSection.module.css';

const PaymentInfoSection: React.FC = () => {
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>결제내역</h3>

      <div className={styles.meta}>
        <div><span>결제수단</span><span>무통장 입금</span></div>
        <div><span>현재상태</span><span>예매</span></div>
        <div><span>결제상태</span><span>결제완료</span></div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>예매번호</th>
            <th>가격등급</th>
            <th>가격</th>
            <th>취소여부</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>A123456</td>
            <td>일반</td>
            <td>110,000원</td>
            <td>취소불가</td>
          </tr>
        </tbody>
      </table>

      <div className={styles.summary}>
        <div><span>예매 수수료</span><span>1,000원</span></div>
        <div><span>배송비</span><span>2,500원</span></div>
        <div className={styles.total}><span>총 결제금액</span><span>113,500원</span></div>
      </div>
    </div>
  );
};

export default PaymentInfoSection;
