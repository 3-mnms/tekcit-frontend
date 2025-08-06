import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/button/Button';
import PasswordInput from '@/components/common/input/Input'
import styles from './VerifyPasswordPage.module.css';

const VerifyPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>비밀번호 확인</h2>
      <p className={styles.desc}>정보 수정을 위해 비밀번호를 입력해주세요.</p>

      <PasswordInput type="password" placeholder="현재 비밀번호" />

      <Button
        className={styles.button}
        onClick={() => navigate('../detail/editinfo')}
      >
        확인
      </Button>
    </section>
  );
};

export default VerifyPasswordPage;
