import React from 'react';
import styles from './TransferRefundGuide.module.css';

const TransferRefundGuide: React.FC = () => {
  return (
    <div className={styles.card} aria-labelledby="transfer-guide-title">
      <h2 id="transfer-guide-title" className={styles.title}>양도/환불 안내</h2>

      <div className={styles.box}>
        <ul className={styles.list}>
          <li>양도는 결제 완료 티켓에 한해 가능합니다.</li>
          <li>양도 진행 후 취소/환불은 불가합니다.</li>
          <li>개인정보는 거래 완료 후 저장되지 않습니다.</li>
        </ul>
      </div>
    </div>
  );
};

export default TransferRefundGuide;
