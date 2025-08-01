// components/my/myInfo/Info.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Info.module.css';

const Info: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>내 정보</h2>

      {/* 기본정보 */}
      <div className={styles.card} onClick={() => navigate('/mypage/info')}>
        <span className={styles.label}>사용자명(기본정보)</span>
        <span className={styles.arrow}>›</span>
      </div>

      {/* 비밀번호 / 계정 / 배송 */}
      <div className={styles.group}>
        <div className={styles.card} onClick={() => navigate('/mypage/password')}>
          <span className={styles.label}>비밀번호 변경</span>
          <span className={styles.arrow}>›</span>
        </div>
        <div className={styles.card} onClick={() => navigate('/mypage/linked')}>
          <span className={styles.label}>연결된 계정</span>
          <span className={styles.arrow}>›</span>
        </div>
        <div className={styles.card} onClick={() => navigate('/mypage/address')}>
          <span className={styles.label}>배송지 관리</span>
          <span className={styles.arrow}>›</span>
        </div>
      </div>

      {/* 회원 탈퇴 */}
      <div className={styles.card} onClick={() => navigate('/mypage/withdraw')}>
        <span className={styles.label}>회원 탈퇴</span>
        <span className={styles.arrow}>›</span>
      </div>
    </section>
  );
};

export default Info;