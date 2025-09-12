import React from 'react';
import CheckPasswordForm from '@/components/my/myinfo/password/CheckPasswordForm';
import ResetPasswordForm from '@/components/my/myinfo/password/ResetPasswordForm';
import styles from './ChangePasswordPage.module.css';
import { FaShieldAlt, FaLock } from 'react-icons/fa';

const ChangePasswordPage: React.FC = () => {
  const [verified, setVerified] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const step = !verified ? 1 : done ? 3 : 2;

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>비밀번호 변경</h2>
      </div>

      {/* 스텝 표시 */}
      <div className={styles.stepper} role="list" aria-label="비밀번호 변경 단계">
        <div className={`${styles.step} ${step >= 1 ? styles.stepActive : ''}`} role="listitem">
          <FaShieldAlt className={styles.stepIcon} aria-hidden />
          <span>현재 비밀번호 확인</span>
        </div>
        <div className={`${styles.step} ${step >= 2 ? styles.stepActive : ''}`} role="listitem">
          <FaLock className={styles.stepIcon} aria-hidden />
          <span>새 비밀번호 설정</span>
        </div>
      </div>

      {!verified && <CheckPasswordForm onVerified={() => setVerified(true)} />}

      {verified && !done && <ResetPasswordForm onSuccess={() => setDone(true)} />}

      {done && <div className={styles.successBox}>✅ 비밀번호가 성공적으로 변경되었어요!</div>}
    </section>
  );
};

export default ChangePasswordPage;
