import React from 'react';
import styles from './PointBox.module.css';

const PointBox: React.FC = () => {
  return (
    <div className={styles.box}>
      <span className={styles.label}>포인트</span>
      <div className={styles.right}>
        <span className={styles.amount}>0P</span>
        <button className={styles.charge}>충전하기 &gt;</button>
      </div>
    </div>
  );
};

export default PointBox;
