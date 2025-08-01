import React from 'react';
import styles from './UserInfoDetail.module.css';

const UserInfoDetail: React.FC = () => {
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>기본정보</h2>
      <div className={styles.card}>
        <p><strong>이름</strong><br />홍길동</p>
        <p><strong>생년월일</strong><br />2025.07.28</p>
        <p><strong>성별</strong><br />여성</p>
        <p><strong>이메일</strong><br />a@example.com</p>
        <button className={styles.button}>본인인증으로 정보 수정</button>
      </div>
    </section>
  );
};

export default UserInfoDetail;
