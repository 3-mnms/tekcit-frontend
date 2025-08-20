import React, { useState } from 'react';
import Button from '@/components/common/button/Button';
import AuthCard from '@/components/auth/find/AuthCard';
import styles from '@/components/auth/find/AuthForm.module.css';
import { useNavigate, useLocation } from 'react-router-dom';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: { loginId?: string; email?: string } };
  const [password, setPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState('');

  const fixedAction = (
    <Button
      onClick={() => {
        if (password !== confirmPassword) return alert('비밀번호가 일치하지 않습니다.');
        // TODO: postResetPasswordWithEmail({ loginId: state?.loginId!, email: state?.email!, newPassword: password })
        alert('비밀번호가 성공적으로 변경되었습니다!');
        navigate('/login');
      }}
      className="w-full h-11"
    >
      비밀번호 변경
    </Button>
  );

  return (
    <AuthCard title="비밀번호 재설정" fixedAction={fixedAction}>
      <input type="password" placeholder="새 비밀번호" value={password}
             onChange={(e) => setPassword(e.target.value)} className={styles.input} />
      <input type="password" placeholder="새 비밀번호 확인" value={confirmPassword}
             onChange={(e) => setConfirmPassword(e.target.value)} className={styles.input} />
    </AuthCard>
  );
};

export default ResetPasswordPage;
