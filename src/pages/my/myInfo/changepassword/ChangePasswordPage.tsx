import React from 'react';
import Button from '@/components/common/button/Button';
import Input from '@/components/common/input/Input'
import styles from './ChangePasswordPage.module.css';

const ChangePasswordPage: React.FC = () => {
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>비밀번호 변경</h2>
      <div className={styles.card}>
        <Input type="password" placeholder="현재 비밀번호" />
        <Input type="password" placeholder="새 비밀번호" />
        <Input type="password" placeholder="새 비밀번호 확인" />

        <Button className={styles.button}>비밀번호 변경</Button>
      </div>
    </section>
  );
};

export default ChangePasswordPage;