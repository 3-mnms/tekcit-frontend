// src/components/my/dropdown/PointBox.tsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PointBox.module.css';
import { getTekcitPayAccount } from '@/shared/api/my/tekcitPay';

const PointBox: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const goByAccount = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      await getTekcitPayAccount();
      navigate('/payment/wallet-point/');
    } catch (e: any) {
      const code = e?.response?.data?.errorCode;
      if (code === 'NOT_FOUND_TEKCIT_PAY_ACCOUNT') {
        alert('테킷페이 계정이 없습니다. 계정 생성 페이지로 이동합니다.');
        navigate('/payment/wallet-point/money-charge');
      } else {
        alert('잔액/계정 조회 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setLoading(false);
    }
  }, [loading, navigate]);

  return (
    <div
      className={styles.box}
      onClick={goByAccount}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && goByAccount()}
      aria-disabled={loading}
    >
      <span className={styles.label}>포인트</span>
      <div className={styles.right}>
        <span className={styles.amount}>{loading ? '0P' : '0P'}</span>
        <button
          className={styles.charge}
          onClick={(e) => {
            e.stopPropagation(); 
            goByAccount();
          }}
          disabled={loading}
        >
          충전하기 &gt;
        </button>
      </div>
    </div>
  );
};

export default PointBox;
